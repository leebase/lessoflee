---
title: 'Setup Beelink'
description: 'Gemini\'s instructions for setting up a Beelink'
pubDatetime: 2026-01-22T00:00:00Z
tags:
  - homelab
---
That is the right attitude. "Belt and Suspenders" (SSH + Desktop) is the best way to manage a home server. If you break the SSH config, you can fix it via NoMachine. If the GUI crashes, you can fix it via SSH.

Since your main condition is **"if it proves that it can stay up,"** your entire success hinges on **Step 2** below. The Ryzen 5800H is fantastic, but without this specific kernel patch, it *will* likely freeze or reboot within 48 hours when it tries to idle.

Here is your **"Day 1 Execution Guide"** to getting that Beelink stable and replacing the VPS.

### Step 1: The Clean Slate

* **Install:** Linux Mint 22 (Cinnamon).
* **Crucial Setting:** During installation, check the box for **"Log in automatically."**
* *Why:* If the power flickers and the box reboots, it needs to log in to the desktop session for NoMachine to start. If it gets stuck at the password screen, your remote desktop won't connect.



### Step 2: The "Stability Fix" (DO NOT SKIP)

*This is what stops the nightly reboots.*
Run this immediately after your first boot, before you even run updates.

1. Open your terminal (or Warp!):
```bash
sudo nano /etc/default/grub

```


2. Find the line `GRUB_CMDLINE_LINUX_DEFAULT="quiet splash"` and change it to:
```bash
GRUB_CMDLINE_LINUX_DEFAULT="quiet splash processor.max_cstate=1"

```


3. Save (`Ctrl+O`, Enter) and Exit (`Ctrl+X`).
4. Apply it and reboot:
```bash
sudo update-grub
sudo reboot

```



### Step 3: The Toolkit Install

Once it comes back up, run this block to get your "VPS Replacement" stack ready (Docker, Tailscale, Warp, NoMachine):

```bash
# 1. Update everything
sudo apt update && sudo apt upgrade -y

# 2. Install Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# 3. Install Tailscale (Your VPN)
curl -fsSL https://tailscale.com/install.sh | sh
sudo tailscale up

# 4. Install Warp Terminal
wget https://app.warp.dev/download?package=deb -O warp.deb
sudo apt install ./warp.deb -y
rm warp.deb

```

*Note: For **NoMachine**, you'll need to download the `.deb` file from their website using Firefox on the Beelink (or `wget` it if you have the link) and install it.*

### The "Burn-In" Test

Once this is set up, I recommend letting it run for **3-4 days** before you cancel that SSDNodes subscription.

* Throw your `sqlserver` container on it.
* Let Syncthing run.
* If it hits **Uptime: 4 Days** without a crash, you have officially beaten the "Windows Nightly Reboot" curse.

Good luck with the wipe! I'm here if you hit any weird errors during the install.
