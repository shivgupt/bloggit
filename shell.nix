{ pkgs ? import <nixpkgs> {} }:
  pkgs.mkShell {
    nativeBuildInputs = with pkgs; [
      docker
      node2nix
      nodejs-16_x
      nodePackages.lerna
      jdk
    ];
}
