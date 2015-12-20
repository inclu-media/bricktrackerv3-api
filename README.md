Configuration
=============

Create a file `/server/config.local.json` with the following content. As this file is not under source control, it will no be used
for building deployment versions but for local runs with `node .` only.

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

For staging and prod deployments use the following script:

```
#!/usr/bin/env bash

SRV_PROD=http://52.21.77.232
SRV_STAG=http://192.168.99.100

if [ -z "$1" ]; then
  echo usage: $0 prod\|stag
  exit
fi

SRV=$SRV_STAG
if [ $1 = "prod" ]; then
  SRV=$SRV_PROD
fi

echo Deploying to $1: $SRV
slc build --git
slc deploy -s api $SRV
slc ctl -C $SRV env-set api PORT=3003
slc ctl -C $SRV env-set api <Password for the app user btv3app@bricktracker.net>
slc ctl -C $SRV env-set api <Google Cloud Messaging API Key>
slc ctl -C $SRV env-set api <Amazon Product Advertising API ID>
slc ctl -C $SRV env-set api <Amazon Product Advertising API Key>
slc ctl -C $SRV env-set api <Amazon Associate Tag>
```

