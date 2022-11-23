{ pkgs ? import <nixpkgs> {} }:
  pkgs.mkShell {
    nativeBuildInputs = with pkgs; [
      curl
      docker
      jdk
      morph
      node2nix
      nodejs-16_x
      nodePackages.lerna
    ];
}
