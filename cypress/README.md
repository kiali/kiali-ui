# HOWTO start cypress


for running cypress locally you need all required dependencies installed on your system. 

using yum 

`sudo yum install -y xorg-x11-server-Xvfb gtk2-devel gtk3-devel libnotify-devel GConf2 nss libXScrnSaver alsa-lib`

or dnf 

`sudo dnf install -y xorg-x11-server-Xvfb gtk2-devel gtk3-devel libnotify-devel GConf2 nss libXScrnSaver alsa-lib` 


than you need nodejs version 14 

`curl -sL https://rpm.nodesource.com/setup_14.x | sudo bash -`

`sudo yum install -y nodejs`

now you should see nodejs and npm installed (example output)

`node -v
v14.18.1`

`npm -v
6.14.15`

last install yarn package manager

`sudo npm install --global yarn`

clone kiali-ui repository and cd into directory

`git clone ...`

`cd kiali-ui`

checkout on right branch

`git checkout cypress-integration`

and setup the project by running

`yarn install`

launch cypress in visual mode

`yarn run cypress open`
