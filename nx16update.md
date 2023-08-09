# NX 16 Update

For the nx 16 update, the project was setup from scratch and old code was added.

We ran the following commands for setup:


npx create-nx-workspace@latest stex-react --preset=ts

npm install --save-dev @nx/next
nx g @nx/next:app alea-frontend

npm install -D @nx/react
nx g @nx/react:app mmt-viewer


copy deps and npm install


keep adding libraries in dependency order
Dont make them buildable libraries.