#!/bin/sh -e
#
# $Id: sync_loop_unix.sh,v 1.6 2015/11/04 18:23:04 gilles Exp gilles $

# Example for imapsync massive migration on Unix systems.
# See also http://imapsync.lamiral.info/FAQ.d/FAQ.Massive.txt
#
# Data is supposed to be in file.txt in the following format:
# host001_1;user001_1;password001_1;host001_2;user001_2;password001_2;
# ...
# Separator is character semi-colon ";" it can be changed by any character changing IFS=';'
# in the while loop below.
# # Each line contains 6 columns, columns are parameter values for
# --host1 --user1 --password1 --host2 --user2 --password2
# and a trailing empty fake column to avaid CR LF part going
# in the 6th parameter password2. Don't forget the last semicolon.
#
# You can add extra options after the variable "$@"
# Use character backslash \ at the end of each suplementary line, except for the last one.
# You can also pass extra options via the parameters of this script since
# they will be in "$@"

# The credentials filename "file.txt" used for the loop can be renamed
# by changing "file.txt" below.

# JRC (Not Implemented)
# If you want a test execution, you can use "--dry" option
# Use: ./sync_loop_unix.sh text_file --dry

LOGDIR=../LOG_imapsync

#echo Looping on account credentials found in file.txt
echo Looping on account credentials found in $1
echo

mkdir $LOGDIR;

{ while IFS=';' read  h1 u1 p1 h2 u2 p2 fake
    do
        { echo "$h1" | egrep "^#" ; } > /dev/null && continue # this skip commented lines in file.txt
        echo "==== Starting imapsync from host1 $h1 user1 $u1 to host2 $h2 user2 $u2 ===="
        docker run gilleslamiral/imapsync imapsync --host1 "$h1" --user1 "$u1" --password1 "$p1" --host2 "$h2" --user2 "$u2" --password2 "$p2" "$@" | tee $LOGDIR/$u1"_"$(date +"%Y-%m-%d:%H:%M:%S").log
        echo "==== Ended imapsync from host1 $h1 user1 $u1 to host2 $h2 user2 $u2 ===="
        echo
    done
} < $1

