# To learn more about how to use Nix to configure your environment
# see: https://firebase.google.com/docs/studio/customize-workspace
{ pkgs, ... }: {
  # Which nixpkgs channel to use.
  channel = "unstable"; # or "unstable"

  # Use https://search.nixos.org/packages to find packages
  packages = [
    pkgs.nodejs_22
    pkgs.corepack
    pkgs.yarn
  ];

  # Sets environment variables in the workspace
  env = {};
  idx = {
    # Search for the extensions you want on https://open-vsx.org/ and use "publisher.id"
    extensions = [
      # "vscodevim.vim"
      "dsznajder.es7-react-js-snippets"
      "esbenp.prettier-vscode"
    ];

    # Enable previews
    previews = {
      enable = true;
      previews = {
        # web = {
        #   # Example: run "npm run dev" with PORT set to IDX's defined port for previews,
        #   # and show it in IDX's web preview panel
        #   command = ["npm", "run", "web"];
        #   manager = "web";
        #   port = 3000;
        # }
      };
    };

    # The following attributes are used to configure your workspace.
    # For more information, see: https://firebase.google.com/docs/studio/customize-workspace
    workspace = {
      # Follows the format of "image-provider:image:tag"
      # Example: "docker.io/ubuntu:latest"


      # Controls the amount of memory available to the workspace.
      # memory = "2Gi";

      # A list of ports that are forwarded from the workspace to the local machine.
      # forwardedPorts = [8080];

      # A list of environment variables that are available in the workspace.
      # env = {
      #   "NODE_ENV": "development"
      # };
    };
  };
}
