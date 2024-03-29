#!/bin/sh
# Script to use fzf to find and attach tmux session

# ERROR CODES
EXIT_SUCCESS=0
INVALID_FLAG_ERROR=1
SESSION_NOT_FOUND_ERROR=2
SESSION_NOT_SELECTED_ERROR=3
SESSION_ALREADY_EXISTS=4

CWD=${PWD##*/}

if [ "$#" -eq 0 ]; then
    SESSION=`tmux ls | awk -F ':' '{print $1}'| tr -d ':' | fzf `
    STATUS=$?

    if [ $STATUS -eq 1 ];then
        echo "Session Not Found!"
        exit $SESSION_NOT_FOUND_ERROR
    fi

    # status check for when nothing is selected in fzf
    if [ $STATUS -eq 130 ];then
        # echo "No session selected"
        exit $SESSION_NOT_SELECTED_ERROR
    fi

    if [ $SESSION ]; then
        tmux attach-session -t $SESSION
    fi
else
    while getopts clhn: flag
    do
        case "${flag}" in
            l)
                tmux ls | awk -F ':' '{print $1}' | tr -d ':'
                exit $EXIT_SUCCESS
                ;;
            n)
                SESSION_NAME="${OPTARG:-$CWD}"
                DIR=${OPTARG##*/}
                tmux has -t "$DIR" 2> /dev/null
                if [ "$?" = "0" ]; then
                    echo "ERROR: Session already Exists!"
                    exit $SESSION_ALREADY_EXISTS
                else
                    if [ -d "$OPTARG" ]; then
                        cd "$OPTARG"
                        tmux new -s "$DIR"
                    fi
                fi
                exit $EXIT_SUCCESS
                ;;
            c)
                tmux new -s "$CWD"
                ;;
            h)
                echo "USAGE ts -flag [optional path]"
                echo "A tool to manage, attach, detach tmux sessions"
                echo ""
                echo "FLAG      DESCRIPTION"
                echo "n         start tmux session with given"
                echo "c         start tmux session at current working directory"
                echo "l         list all tmux sessions"
                echo "h         Display help for ts"
                exit $EXIT_SUCCESS
                ;;
            \?)
                echo "Invalid option: -$OPTARG" >&2
                exit $INVALID_FLAG_ERROR
                ;;
        esac
    done
fi
