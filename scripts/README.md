# 🔑 How to Set Up Google Drive API with a Service Account

This guide walks you through creating a `service-account-key.json` file and configuring access to Google Drive using a Google Cloud service account in order to use the download-images script.

### 1. Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Click the **project selector** (top bar) and click **"New Project"**.
3. Give your project a name (e.g., `TCG Pocket Collection Tracker`) and click **"Create"**.

---

### 2. Enable the Google Drive API

1. Inside your project, go to **APIs & Services > Library**.
2. Search for **Google Drive API**.
3. Click on it, then click **Enable**.

---

### 3. Create a Service Account

1. Go to **IAM & Admin > Service Accounts**.
2. Click **"Create Service Account"**.
3. Give it a name (e.g., `tcg-api-service`), click **"Create and Continue"**.
4. Grant it the role: **"Project > Editor"** (or more restricted, if needed).
5. Click **Done**.

---

### 4. Generate a JSON Key File

1. In the **Service Accounts** list, click on your service account.
2. Go to the **"Keys"** tab.
3. Click **"Add Key" > "Create new key"**.
4. Choose **JSON** and click **Create**.
5. A JSON file will be downloaded – **keep it safe**.
6. Rename it to `service-account-key.json` for easier reference.

---

### 5. Use the `service-account-key.json` in the script folder

Put the downloaded `service-account-key.json` in scripts folder of the project. This file contains the credentials needed to authenticate your service account.
