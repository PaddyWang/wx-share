#!/bin/bash

case "$1" in
    runserver)
        exec python3 manage.py "$@"
    ;;
esac

if [ -z $1 ] ; then
    exec gunicorn -b 0.0.0.0:8000 -w 1  -p /var/run/adjutant.pid peige.wsgi:application
fi