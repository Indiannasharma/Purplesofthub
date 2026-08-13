# Development Container Notes

- `docker compose up --build` starts the hot-reload development stack.
- The app source is bind-mounted into the container.
- `node_modules` is kept in a named volume so dependencies are not reinstalled on every restart.
- `.next` is also kept in a named volume so local build artifacts do not pollute the host.
