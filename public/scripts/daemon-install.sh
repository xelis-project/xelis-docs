#!/bin/bash

set -e

echo "#####################################"
echo "#  XELIS Blockchain Daemon Install  #"
echo "#####################################"
echo ""

# Detect OS
OS="unknown"
case "$(uname -s)" in
    Linux*)     OS="linux";;
    Darwin*)    OS="macos";;
    CYGWIN*|MINGW*|MSYS*) OS="windows";;
esac

echo "Detected OS: $OS"

# Clone repo if missing
if [ ! -d "xelis-blockchain" ]; then
  echo "Cloning the repository..."
  git clone https://github.com/xelis-project/xelis-blockchain.git
fi

cd xelis-blockchain

# Install dependencies
install_deps() {
    case "$OS" in
        linux)
            echo "Checking Linux dependencies..."
            if ! command -v gcc &> /dev/null; then
                echo "Installing GCC and build tools..."
                sudo apt-get update
                sudo apt-get install -y gcc cmake build-essential unzip curl
            fi
            ;;
        macos)
            echo "Checking macOS dependencies..."
            if ! command -v brew &> /dev/null; then
                echo "Installing Homebrew..."
                /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
            fi
            brew install gcc cmake unzip curl || true
            ;;
        windows)
            echo "Checking Windows dependencies..."
            if ! command -v gcc &> /dev/null; then
                echo "Please install MinGW or MSVC build tools manually!"
                echo "Using winget to install build essentials..."
                winget install -e --id MSYS2.MSYS2 || true
            fi
            if ! command -v unzip &> /dev/null; then
                winget install -e --id GnuWin32.UnZip || true
            fi
            ;;
    esac
}

install_deps

# Rust setup
if [ -d "$HOME/.cargo/env" ]; then
  source "$HOME/.cargo/env"
fi

if ! command -v rustup &> /dev/null; then
  echo "Installing Rustup..."
  curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
  source "$HOME/.cargo/env"
else
  echo "Updating Rust..."
  rustup update
fi

# Build project
echo "Building the project..."
cargo build --release

# Bootstrap option
if [ ! -d "mainnet" ]; then
  read -e -p "Do you want to bootstrap? Y: Download and use latest snapshot. N: Sync from scratch. (Y/N): " choice
  if [[ "$choice" == [Yy]* ]]; then
    echo "Downloading mainnet snapshot..."
    curl -L -o mainnet.zip https://node.xelis.io/files/mainnet.zip
    unzip mainnet.zip -d mainnet
  fi
fi

# Create start.sh only if missing
if [ ! -f "start.sh" ]; then
  echo ""
  echo "Select the sync mode to use:"
  echo "0: Normal sync   (full chain, slow but low resource usage)"
  echo "1: Boost sync    (full chain, faster but uses more resources)"
  echo "2: Fast sync     (pruned chain, low disk usage but sync only top chain)"
  echo ""
  echo "Recommended option: 1"
  echo ""
  read -e -p "Enter your choice (0/1/2): " sync_choice

  SYNC_PARAM=""
  case "$sync_choice" in
    1) SYNC_PARAM="--allow-boost-sync" ;;
    2) SYNC_PARAM="--allow-fast-sync" ;;
    *) SYNC_PARAM="" ;;
  esac

  echo "Creating the script for easier startup..."
  echo "#!/bin/bash" > start.sh
  echo "./target/release/xelis_daemon $SYNC_PARAM" >> start.sh
  chmod +x start.sh
fi

echo ""
echo "For future start, use ./start.sh"
./start.sh
