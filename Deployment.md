## AWS Deployment Instructions

### Architecture Overview

Based on analyzing the codebase, the key components to deploy are:

- Next.js application
- Node.js/Express backend API
- MySQL database

The recommended AWS architecture is:

- Next.js app served via Amplify Hosting for automatic build and deployment from source control
- Express API deployed as a Lambda function behind API Gateway
- MySQL database using Amazon RDS

### Detailed Steps

1. **Create an RDS MySQL database**

   - In the AWS Console, navigate to the RDS service
   - Click "Create database" and select MySQL as the engine type
   - Choose the appropriate instance size based on your anticipated load. The t2.micro is a good starting point for small-medium apps.
   - Specify a DB name, username and password. Make note of these as you'll need them later.
   - Configure the VPC, subnet and security group settings to allow access from the Lambda function
   - Complete the creation wizard and wait for the DB to become available

2. **Package the Express API for Lambda**

   - Modify the `server.js` file to export the Express app object
   - Add a new file `lambda.js` with the following contents:

     ```js
     const awsServerlessExpress = require("aws-serverless-express");
     const app = require("./server");
     const server = awsServerlessExpress.createServer(app);

     exports.handler = (event, context) =>
       awsServerlessExpress.proxy(server, event, context);
     ```

   - Add `aws-serverless-express` to your `package.json` dependencies and run `npm install`
   - Create a `.npmignore` file to exclude unnecessary files from the Lambda package
   - Zip up the Lambda code with `zip -r api.zip .`

3. **Deploy the API to Lambda**

   - In the AWS Console, navigate to the Lambda service
   - Click "Create function" and choose "Author from scratch"
   - Enter a name for your function and select "Node.js" as the runtime
   - For "Code entry type", select "Upload a .zip file" and choose the `api.zip` file you created
   - Under "Configuration" specify a new role to allow the function to access the RDS database
   - Click "Create function"
   - Make note of the function's HTTP API endpoint

4. **Update database configuration**

   - Modify `database/db.js` to use the RDS database connection details:
     ```js
     const connection = await mysql.createConnection({
       host: process.env.DB_HOST,
       user: process.env.DB_USER,
       password: process.env.DB_PASSWORD,
       database: process.env.DB_NAME,
     });
     ```
   - Add the `DB_*` environment variables to `.env` with the RDS values

5. **Create an Amplify Hosting app**

   - In the AWS Console, navigate to the Amplify service
   - Click "Get Started" under "Amplify Hosting"
   - Choose GitHub (or your source control provider) as the repository
   - Select the branch to deploy from (e.g. main)
   - For "App name" enter a name for your app
   - Expand "Advanced settings", select "Full CI/CD" and click Next
   - Keep the default build settings and click Next

6. **Add environment variables**

   - In the Amplify app settings, navigate to "Environment variables"
   - Add the `DB_*` variables with the RDS connection details
   - Also add an `API_ENDPOINT` variable with the Lambda HTTP API endpoint
   - Trigger a new deploy for the variables to take effect

7. **Configure the Next.js app**

   - Update `next.config.js` to set the `target` as 'serverless' for Lambda compatibility:
     ```js
     module.exports = {
       target: "serverless",
     };
     ```
   - Add `next-on-amplify` to your `package.json` dev dependencies to enable server-side rendering on Amplify
   - Modify API calls to use the `API_ENDPOINT` environment variable

8. **Deploy!**
   - Commit and push your code changes
   - Amplify will automatically build and deploy your app
   - Once the deploy is finished, your app will be live at the Amplify URL

### Additional Considerations

A few points to double check and keep in mind:

- Make sure your `.gitignore` file excludes any sensitive configs or `.env` files
- Verify the MySQL connection details and ensure the Lambda has access to the RDS database
- Check if there are any custom build steps defined in `package.json` that need to be configured in Amplify
- Validate the API_ENDPOINT is publicly accessible and CORS is properly configured
- Monitor build logs in Amplify and Lambda function logs in CloudWatch for any errors

With these steps you should have your Next.js app up and running on AWS! Let me know if you have any other questions.
