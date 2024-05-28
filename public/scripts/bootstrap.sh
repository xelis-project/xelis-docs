#!/bin/bash

set -e

echo "#####################################"
echo "# XELIS Blockchain Bootstrap Script #"
echo "#####################################"
echo ""

if [ ! -d "xelis-blockchain" ]; then
  echo "Cloning the repository..."
  git clone https://github.com/xelis-project/xelis-blockchain.git
fi

echo "Changing directory..."
cd xelis-blockchain

echo "Checking if C linker is missing..."
if ! command -v gcc &> /dev/null; then
  echo "Installing GCC..."
  sudo apt-get update
  sudo apt-get install -y gcc
fi

if [ -d "$HOME/.cargo/env" ]; then
  source "$HOME/.cargo/env"
fi

echo "Checking Rustup (rustc and cargo)..."
if ! command -v rustup &> /dev/null; then
  echo "Installing Rustup..."
  curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
fi

if rustup --version | grep -q "update"; then
  echo "Updating Rustup..."
  rustup update
fi

echo "Building the project..."
cargo build --release

if [ ! -d "mainnet" ]; then
  read -e -p "Do you want to bootstrap? Y: Download and use latest snapshot. N: Sync from scratch with boost sync. (Y/N)" choice
  if [[ "$choice" == [Yy]* ]]; then
    echo "Downloading mainnet snapshot..."
    curl -o mainnet.zip https://node.xelis.io/files/mainnet.zip

    if ! command -v unzip &> /dev/null; then
      echo "Checking if unzip package is missing..."
      sudo apt-get install -y unzip
    fi

    echo "Unzipping mainnet folder..."
    unzip mainnet.zip -d mainnet
  fi
fi

echo "Starting the blockchain..."
./target/release/xelis_daemon --allow-boost-sync
