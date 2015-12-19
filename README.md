Configuration
=============

Create a file `/server/config.local.json` with the following content:

```
{
     "btv3": {
       "appUserPassword":    <Password for the app user btv3app@bricktracker.net>,
       "gcmServerApiKey":    <Google Cloud Messaging API Key>,
       "awsAccessKeyID":     <Amazon Product Advertising API ID>,
       "awsSecretAccessKey": <Amazon Product Advertising API Key>,
       "awsAssociateTag":    <Amazon Associate Tag>
     }
   }
```

Deployment
==========

DEV Environment
---------------

Start dev docker-compose
```
$ node .
```

STAGING Environment (local PROD)
--------------------------------

Start prod (default) docker-compose

```
$ slc build --git
$ slc deploy -s api http://192.168.99.100
$ slc ctl -C http://192.168.99.100 env-set api PORT=3003
$ slc ctl -C http://192.168.99.100 restart api
```

Check Logs

```
$ slc ctl -C http://192.168.99.100 log-dump api
```

Stopping the service

```
$ slc ctl -C http://192.168.99.100 remove api
```
