#!/bin/bash
cd ~/ScoutNS
git pull origin dev
npm run build
pm2 restart scoutns-dev
