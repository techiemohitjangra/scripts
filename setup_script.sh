#!/bin/sh

# Errors
FAILED_TO_INSTALL_ERROR=1

packages=("kitty" "rust" "cargo" "golang" "nodejs" "npm" "neovim" "tmux" "git" "make" "clang" "gcc" "firefox" "fzf" "xclip" "ttf-jetbrains-mono-nerd" "ttf-ubuntu-mono-nerd" "ttf-ubuntu-nerd" "ttf-roboto-mono-nerd" "ttf-nerd-fonts-symbols" "ttf-nerd-fonts-symbols-mono" "ttf-tinos-nerd" "zsh" "curl" "wget" "man-db" "unzip" "ffmpeg" "feh")

# check if pacman exist
pacman --version &>/dev/null
RETURN=$?

if [ $RETURN -eq 0 ];
then
    echo "PACMAN package manager found!"
    PACKAGE_MANAGER=pacman

    for package in ${packages[@]}
    do
        pacman -Sy $package
        RESULT=$?
        if [ $RESULT -ne 0 ];
        then
            echo "Failed to install $package"
            exit $FAILED_TO_INSTALL_ERROR
        fi
    done
fi

# check if apt exist
apt --version &>/dev/null
RETURN=$?

if [ $RETURN -eq 0 ];
then
    echo "APT package manager found!"
    PACKAGE_MANAGER=apt

    for package in ${packages[@]}
    do
        apt install $package
        RESULT=$?
        if [ $RESULT -ne 0 ];
        then
            echo "Failed to install $package"
            exit $FAILED_TO_INSTALL_ERROR
        fi
    done
fi

# check if dnf exist
dnf --version &>/dev/null
RETURN=$?

if [ $RETURN -eq 0 ];
then
    echo "DNF package manager found!"
    PACKAGE_MANAGER=dnf

    for package in ${packages[@]}
    do
        dnf install $package
        RESULT=$?
        if [ $RESULT -ne 0 ];
        then
            echo "Failed to install $package"
            exit $FAILED_TO_INSTALL_ERROR
        fi
    done
fi

# install oh-my-zsh
sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"

exit 0
