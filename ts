#!/usr/bin/env bash
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

    # status check for when nothing is selected in fzf
    if [ $STATUS -eq 130 ]; then
        # echo "No session selected"
        exit $SESSION_NOT_SELECTED_ERROR
    fi

    if [ $STATUS -eq 1 ]; then
        echo "Session Not Found!"
        exit $SESSION_NOT_FOUND_ERROR
    fi

    # using "" around variable ensures spaces are preserved in SESSION
    # and uses the entire string as session name and not just first word
    if [ "$SESSION" ]; then
        if [[ -z "${TMUX}" ]]; then
            tmux attach-session -t "$SESSION"
        else
            tmux switch-client -t "$SESSION"
        fi
        exit $EXIT_SUCCESS
    fi
else
    while getopts clha:n: flag
    do
        case "${flag}" in
            l)
                tmux ls | awk -F ':' '{print $1}' | tr -d ':'
                exit $EXIT_SUCCESS
                ;;
            n)
                SESSION_NAME="${OPTARG:-$CWD}"
                DIR=${OPTARG##*/}

                # check if the session already exists
                if tmux list-sessions | awk -F: '{print $1}' | grep -q "^${DIR}$"; then
                    echo "ERROR: Session already Exists!"
                    exit $SESSION_ALREADY_EXISTS
                else
                    if [ -d "$OPTARG" ]; then
                        cd "$OPTARG"
                        # checks if a tmux session is now attached
                        if [[ -z "${TMUX}" ]]; then # true, if not in tmux session
                            # creates and attaches to session for given directory
                            tmux new-session -s "$DIR" -c "$PWD"
                        else
                            # only creates a session for given directory
                            tmux new-session -d -s "$DIR" -c "$PWD"
                            # switch to the newly created session
                            tmux switch-client -t "$DIR"
                        fi
                    fi
                fi
                exit $EXIT_SUCCESS
                ;;
            a)
                SESSION_NAME="${OPTARG:-$CWD}"
                DIR="${OPTARG##*/}"

                # check if the session already exists
                if tmux list-sessions | awk -F: '{print $1}' | grep -q "^${DIR}$"; then
                    echo "ERROR: Session already Exists!"
                    exit $SESSION_ALREADY_EXISTS
                else
                    if [ -d "$OPTARG" ]; then
                        cd "$OPTARG"
                        # only creates a session for given directory,
                        # but does not attach to it
                        tmux new-session -d -s "$DIR" -c "$PWD"
                    fi
                fi
                exit $EXIT_SUCCESS
                ;;
            c)
                # checks if a tmux session is now attached
                if [[ -z "${TMUX}" ]]; then # true, if not in tmux session
                    # creates and attaches to session for current directory
                    tmux new-session -s "$CWD" -c "$PWD"
                else
                    # only creates a session for current directory
                    tmux new-session -d -s "$CWD" -c "$PWD"
                    # switch to the newly created session
                    tmux switch-client -t "$CWD"
                fi
                ;;
            h)
                echo "USAGE ts -flag [optional path]"
                echo "A tool to manage, attach, detach tmux sessions"
                echo ""
                echo "FLAG      DESCRIPTION"
                echo "n         start tmux session with given path and attach it"
                echo "a         start tmux session with given path without attaching it"
                echo "c         start tmux session at current working directory"
                echo "l         list all tmux sessions"
                echo "h         Display help for ts"
                exit $EXIT_SUCCESS
                ;;
            \?)
                echo "Invalid option: -$OPTARG" >&2
                echo "USAGE ts [-flag] [-h] [optional path]"
                exit $INVALID_FLAG_ERROR
                ;;
        esac
    done
fi
