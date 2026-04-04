# BUG: Global Routing Defaults to Forgot Password

## Expected Behavior
1. `index.html` inside `src/frontend` must be created or updated to serve as the true entry point and immediately load the Register page.
2. A global routing audit must be performed on all files in `src/frontend` to ensure navigation links are properly wired together so a user can fluidly click through the intended flow: Register -> Log In -> Forgot Password -> Payment UI.