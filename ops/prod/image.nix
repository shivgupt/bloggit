{ pkgs ? import <nixpkgs> { } }:
let config = {
  system.stateVersion = "22.05";
  imports = [ <nixpkgs/nixos/modules/virtualisation/digital-ocean-image.nix> ];
};
in
(pkgs.nixos config).digitalOceanImage
