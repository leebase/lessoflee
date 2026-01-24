---
title: 'Migrate Sql Server from SSDNodes to Local Linux'
description: 'Walk through of how Warp agents made migrating sql server a piece of cake'
pubDatetime: 2026-01-22T00:00:00Z
tags:
  - homelab
---
# Agent Migration Log: Moving SQL Server from VPS to Localhost

This document outlines a session using an AI agent to migrate a SQL Server Docker container and its data volume from a remote host backup (SSDNodes) to a local Linux machine. It highlights the agent's ability to plan, adapt to user constraints, and self-correct configuration errors.

## The Objective

**User Prompt:**

> "In this dir are two files, a docker compose file and a docker volume backup. These come from my hosted ssdnodes.com vps. Your task is to migrate these to this machine. ~/docker-containers/sqlserver is where they should live on this computer. Let me know if you understand the task. Make a plan and get my approval before acting"

## Phase 1: Context & Planning

The agent first analyzed the source directory, identifying `docker-compose.yml` and a 692MB volume backup `sqlserver-data.tar.gz`. It initially proposed a standard migration, but the user intervened to refine the storage strategy.

**User Instruction:**

> "So we need a volume on this computer, and the docker-compose.yml needs to be changed to refer to it. Don't worry about the password being in the compose file"

The agent adjusted the plan to use a local bind mount. However, the user corrected this to prefer a Docker Named Volume.

**User Instruction:**

> "I liked named volume, but it still needs to point to where we unarchive the data"

**Final Plan Formulation:**
The agent synthesized a complex plan to satisfy the "Named Volume" requirement while ensuring the archived data was correctly injected into it:

1. Keep the named volume architecture.
2. Manually create the volume `sqlserver-data`.
3. **Complex Step:** Use a temporary utility container to mount *both* the new volume and the backup data to perform the extraction (injecting the data into the managed volume).

## Phase 2: Execution Highlights

### 1. Volume Creation & Data Injection

Instead of just unzipping the file, the agent had to "sideload" the data into the Docker volume system.

* **Step A:** Extracted the tarball to a temporary location (`/tmp/sqlserver-restore`).
* **Step B:** Used a temporary Ubuntu container to copy the data into the Docker volume.

```bash
# Agent logic: Mount the named volume to /var/opt/mssql and the temp files to /backup
docker run --rm -v sqlserver-data:/var/opt/mssql -v /tmp/sqlserver-restore:/backup ubuntu bash -c "cp -a /backup/. /var/opt/mssql/"

```

### 2. The "Agent Save" (Self-Correction)

After injecting the data, the agent attempted to start the container using `docker compose up`.

**The Issue:**
The agent noticed that Docker Compose automatically created a *new* namespaced volume (`sqlserver_sqlserver-data`) rather than using the `sqlserver-data` volume the agent had just meticulously populated.

**The Fix:**
Without requiring user intervention, the agent recognized the configuration drift, stopped the container, removed the empty volume, and rewrote the `docker-compose.yml` to explicitly tag the volume as external.

*Agent applied edit to `docker-compose.yml`:*

```yaml
volumes:
  sqlserver-data:
    external: true  # Added by agent to force usage of the populated volume

```

### 3. Verification & Handover

The agent successfully started the container. It scanned the logs to confirm that the databases from the backup (dbBasics, dbTester, JProCo, etc.) were initializing.

**User Issue:**

> "The TCP/IP connection to the host localhost, port 1433 has failed."

**Agent Resolution:**
The agent checked the port mappings and reminded the user that the `docker-compose.yml` mapped the internal SQL port (1433) to a custom host port.

> "The container is running and mapped to port **5433** on localhost... Try connecting to **localhost:5433**."

---

**Summary:** The agent successfully migrated a database container by orchestrating file operations, complex volume mounting commands, and editing configuration files to resolve naming conflicts, effectively cloning the VPS environment to the local home lab.