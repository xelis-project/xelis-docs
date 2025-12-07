#!/bin/bash

echo "#####################################"
echo "#  XELIS Blockchain Daemon Install  #"
echo "#####################################"
echo ""

# Detect shell & OS
CURRENT_SHELL=$(basename "$SHELL")
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

# Function to detect Clang version and switch to GCC if too old
# see https://gcc.gnu.org/bugzilla/show_bug.cgi?id=95189
detect_compiler() {
    echo "Detecting Clang compatibility..."
    local version
    version=$(clang --version 2>/dev/null | sed -n 's/.*version \([0-9][0-9]*\).*/\1/p' | head -n1)

    if [[ -z "$version" ]]; then
        version=0
    fi

    echo "APT candidate Clang version: $version"

    if [[ "$version" -lt 14 || "$version" -eq 0 ]]; then
        echo "Clang $version is too old or not available. Installing GCC instead."
        sudo apt-get install -y software-properties-common

        # Install GCC 13 on Ubuntu if not already installed
        if grep -qi ubuntu /etc/os-release 2>/dev/null; then
          if ! grep -q "ubuntu-toolchain-r/test" /etc/apt/sources.list /etc/apt/sources.list.d/* 2>/dev/null; then
              echo "Adding PPA for newer GCC versions..."
              sudo add-apt-repository -y ppa:ubuntu-toolchain-r/test
              sudo apt-get update
          fi

          sudo apt-get install -y gcc-13 g++-13
          export CC=gcc-13
          export CXX=g++-13
        else
          echo "installing GCC from default repositories."
          if command -v dnf &>/dev/null; then
              # Fedora / RHEL / Rocky
              sudo dnf install -y gcc gcc-c++
          elif command -v yum &>/dev/null; then
              # CentOS 7 / RHEL 7
              sudo yum install -y gcc gcc-c++
          elif command -v pacman &>/dev/null; then
              # Arch Linux
              sudo pacman -Syu --noconfirm gcc
          elif command -v apt-get &>/dev/null; then
              # Debian (no Ubuntu PPA)
              sudo apt-get install -y gcc g++
          else
              echo "Unsupported package manager. Please install GCC 11+ manually."
              return 1
          fi
          export CC=gcc
          export CXX=g++
        fi
    else
        export CC=clang
        export CXX=clang++
        echo "Clang $version is recent enough. Using Clang."
    fi
}

# Install dependencies
install_deps() {
    case "$OS" in
        linux)
            echo "Checking Linux dependencies..."

            # Detect package manager and install dependencies
            if command -v dnf &>/dev/null; then
                # Fedora / RHEL / Rocky
                sudo dnf install -y git gcc gcc-c++ cmake make unzip curl llvm-devel clang
            elif command -v yum &>/dev/null; then
                # CentOS 7 / RHEL 7
                sudo yum install -y git gcc gcc-c++ cmake make unzip curl llvm-devel clang
            elif command -v pacman &>/dev/null; then
                # Arch Linux
                sudo pacman -Syu --noconfirm git gcc cmake make unzip curl llvm clang
            else
              sudo apt-get update
              sudo apt-get install -y git gcc cmake build-essential unzip curl llvm-dev libclang-dev clang
            fi

            # Because of aws-lc-rs dependency, we need at least Clang 14
            # so we check the version and switch to GCC if Clang is too old
            detect_compiler
            ;;
        macos)
            echo "Checking macOS dependencies..."
            if ! command -v brew &> /dev/null; then
                echo "Installing Homebrew..."
                /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
            fi
            brew install gcc cmake unzip curl llvm || true
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

echo "Installing necessary dependencies..."
install_deps

# Rust setup
if ! command -v rustup &> /dev/null; then
  echo "Installing Rustup..."
  curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
  if [ "$CURRENT_SHELL" = "fish" ]; then
    if [ -f "$HOME/.cargo/env" ]; then
        echo "Detected Fish shell. Loading Rust environment for Fish..."
        source "$HOME/.cargo/env.fish"
    fi
  else
    if [ -f "$HOME/.cargo/env" ]; then
        echo "Detected $CURRENT_SHELL shell. Loading Rust environment..."
        # Use '.' instead of source for POSIX compatibility
        . "$HOME/.cargo/env"
    fi
  fi
else
  echo "Updating Rust..."
  rustup update
fi

# Build project
echo "Updating the repository..."
git pull
echo "Building the project..."

# Ask which binaries to build, default to all
echo ""
echo "Select which binaries to build:"
echo "1) Daemon (xelis_daemon)"
echo "2) Wallet (xelis_wallet)"
echo "3) Miner (xelis_miner)"
echo "4) All (default)"
echo ""
read -p "Enter your choice (1/2/3/4) [default: 4]: " build_choice

BUILD_PARAMS=""
case "$build_choice" in
  1) BUILD_PARAMS="--bin xelis_daemon" ;;
  2) BUILD_PARAMS="--bin xelis_wallet" ;;
  3) BUILD_PARAMS="--bin xelis_miner" ;;
  *) BUILD_PARAMS="" ;;
esac

echo "Building with: cargo build --release $BUILD_PARAMS"
cargo build --release $BUILD_PARAMS

# Bootstrap option
if [ ! -d "mainnet" ]; then
  read -p "Do you want to bootstrap? Y: Download and use latest snapshot. N: Sync from scratch. (Y/N): " choice
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
  read -p "Enter your choice (0/1/2): " sync_choice

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
echo "For future start, use ./start.sh directly"
./start.sh
