# Production Container Notes

- Build the runtime image with the `runner` stage from `Dockerfile`.
- The final image is non-root and uses Next.js standalone output.
- Use the optional nginx profile if you want a reverse proxy in front of the app container.
