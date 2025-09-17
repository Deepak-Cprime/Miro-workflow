# Deployment Guide - Render

## Steps to Deploy to Render

### 1. Prepare Your Repository
- Ensure your code is in a Git repository (GitHub, GitLab, or Bitbucket).
- Commit and push your latest changes before deploying.

### 2. Create Render Account
- Go to [render.com](https://render.com)
- Sign up with your GitHub/GitLab account

### 3. Deploy Web Service
1. Click "New +" → "Web Service"
2. Connect your repository
3. Configure:
   - **Name:** miro-workflow-analyzer
   - **Environment:** Node
  - **Build Command:** `npm install && npm run build`
  - **Start Command:** `npm run start:server`
  - **Plan:** Free
  - **Important:** Your server must listen on the port provided by the `PORT` environment variable (i.e., `process.env.PORT`).

### 4. Set Environment Variables
In Render dashboard, add these environment variables:

**Required:**
- `MIRO_ACCESS_TOKEN` - Your Miro API token
- `OPENAI_API_KEY` - Your OpenAI API key
- `TARGET_API_BASE_URL` - Your TargetProcess API base URL
- `TARGET_API_ACCESS_TOKEN` - Your TargetProcess access token
- `NODE_ENV` - Set to `production`
- `PORT` - Will be automatically set by Render (do not hardcode; always use `process.env.PORT` in your server)

**Optional:**
- `PROJECT_ID` - Default project ID (can be overridden by API calls)

### 5. Deploy
Click "Create Web Service". Render will automatically build and deploy your app. On every push to your repository, Render will redeploy.

### 6. Get Your API URL
After deployment, you'll get a URL like:
`https://miro-workflow-analyzer-xxxx.onrender.com`

### 7. Update TargetProcess Automation Rule
Use your Render URL in TargetProcess:

**URL:** `https://your-app-name.onrender.com/api/analyze`
**Body:**
```json
{
  "projectId": "${project.id}",
  "boardId": "uXjVJXqJT1w"
}
```

## API Endpoints Available
- `POST /api/analyze` - Main workflow analysis
- `GET /api/boards?projectId=<id>` - List boards
- `GET /health` - Health check

## Notes
- Free tier may sleep after 15 minutes of inactivity
- First request after sleep takes ~30 seconds to wake up
- For production use, consider paid plans for always-on service
- Make sure your server code uses `process.env.PORT` for the port number (required by Render).