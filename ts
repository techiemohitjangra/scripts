#!/bin/sh

# Script to use fzf to find and attach tmux session

# TODO: selecting 'DSA & Algorithms | The Primeagen' in fzf output does not work
CWD=${PWD##*/}

if [ "$#" -eq 0 ]; then
    SESSION=`tmux ls | awk -F ':' '{print $1}'| tr -d ':' | fzf `
    tmux attach-session -t $SESSION
else
    while getopts cln: flag
    do
        case "${flag}" in
            l) tmux ls | awk -F ':' '{print $1}' | tr -d ':';;
            n)
                SESSION_NAME="${OPTARG:-$CWD}"
                DIR=${OPTARG##*/}
                tmux has -t "$DIR" 2> /dev/null
                if [ "$?" = "0" ]; then
                    echo "ERROR: Session already Exists!"
                else
                    if [ -d "$OPTARG" ]; then
                        cd "$OPTARG"
                        tmux new -s "$DIR"
                    fi
                fi
                ;;
            c)
                tmux new -s "$CWD"
                ;;
            \?)
                echo "Invalid option: -$OPTARG" >&2
                exit 1
                ;;
        esac
    done
fi
