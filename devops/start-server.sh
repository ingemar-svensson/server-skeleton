#!/bin/bash
cd /opt/codedeploy-agent/deployment-root/$DEPLOYMENT_GROUP_ID/$DEPLOYMENT_ID/deployment-archive
sudo pm2 kill
sudo pm2 start devops/ecosystem.config.js