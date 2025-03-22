# Travel Fun - Frontend

A Next.js application for planning travel itineraries with AI assistance.

## Local Development

1. Clone the repository
2. Install dependencies:

   ```
   npm install
   ```

3. Copy the `.env.example` file to `.env.local` and fill in your API keys.
4. Run the development server:

   ```
   npm run dev
   ```

## Deployment to Netlify

### Automatic Deployment (Recommended)

1. Create a Netlify account and connect to your GitHub repository.
2. Configure the build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`
3. Configure environment variables in Netlify dashboard:
   - NEXT_PUBLIC_API_URL: URL of your backend API
   - NEXT_PUBLIC_GOOGLE_PLACES_API_KEY: Your Google Places API key
   - Any other required API keys

### Manual Deployment

1. Install Netlify CLI:

   ```
   npm install -g netlify-cli
   ```

2. Build the project:

   ```
   npm run build
   ```

3. Deploy to Netlify:

   ```
   netlify deploy --prod
   ```

## Backend Configuration

This frontend application requires a backend API service running at the URL specified in `NEXT_PUBLIC_API_URL`. Make sure to deploy the backend and update the `.env.production` file with the correct URL before deploying the frontend.

## Notes

- The application is configured to work with both local development (<http://127.0.0.1:8001>) and a deployed backend specified via environment variables.
- Make sure to secure your API keys and only expose necessary keys as NEXT_PUBLIC_ variables.
