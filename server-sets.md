"C:\Users\judit\Downloads\pocketbase"

scp "$env:C:\Users\judit\Downloads\pocketbase" root@2.24.200.212:/opt/pocketbase/pocketbase

/opt/pocketbase/pocketbase superuser upsert atlantatvmountpro@gmail.com 'Alphanewx@888!'

/opt/pocketbase/pocketbase --dir=/opt/pocketbase/data superuser upsert atlantatvmountpro@gmail.com 'Alphanewx@888!'

node tools/api-seed-team.js https://atlantatvmount.com/hcgi/platform "atlantatvmount@gmail.com" "Alphanewx@888!"

Before we begin lets make some changes to the overall architecture - update the devloplment/implentation plan document. Which break it all down into a phased development plan that maximizes tokens while being most productive
1. The site which is also accesible from the west (USA etc) should have content specifc to each region: language, images and protocols. Especially with payment, when users login from USA for instance the focus should be on preffered payment methods used in the USA
2. Rather than intermavnmusic.com, the domain name for the music platform shall be tunemavens.com. Everything else on the platform as before
3. We shall need to create an Ai testing agent. The goal of which is to be able to assimilate each user and perform all posibble tasks and functions on front and backend. Use industry best practices and best of bread 2030 tech. Add this to the documents and provide for review. Testing Environment Scope: both local and live. Execution Triggers: Make it a manual tool that can be kicked up from the backend admin
Add this to our overall documentation and go live plan
4. For language support, ensure that the options change to reflect the predominant langauages in the region
5. Ensure 'forgot password' feature and ful protocols exist for all arears where logging in is required. Use best in breed 2030 best practices
6. Pricing, and all other payments sections and texts along with all other content should change depensing on location: USD for USA, Shilling for Kenya, Euro's in Europe etc and ensure the conversions and accurate rounded out to the nearest highest solid number - Use, .99 for USA and other western prices e.g $4.99 rather than $5.00

Generally update the platform throughout to not only target Africans, lets use geolocation to provide more customized content and language

git clone https://github.com/tunnel-vision-web/intermaven .

REACT_APP_API_URL=https://intermaven.onrender.com

cd /var/www/intermaven.io/app/frontend
npm install
npm run build



git config --global user.name "Tim Waindi"
git config --global user.email "atlantatvmount@gmail.com.com"

If your deployment workflow is already committed in .github/workflows and it has on: push for your branch, then yes — it runs automatically on every push. GitHub Actions triggers workflows from YAML files in .github/workflows when the matching event happens. Workflow syntax for GitHub Actions

If the workflow is set to workflow_dispatch only, or it hasn’t been merged to the default branch yet, then you’ll still need to run it manually or keep using terminal commands. GitHub also notes the workflow file must exist on the default branch for the event to trigger. Events that trigger workflows - GitHub Docs



cat > /usr/local/bin/intermaven-deploy <<'EOF'
#!/usr/bin/env bash
set -euo pipefail

cd /srv/intermaven/frontend
npm run build

mkdir -p /var/www/intermaven.io/app/frontend/build
rsync -a --delete build/ /var/www/intermaven.io/app/frontend/build/

echo "Deploy complete."
EOF

chmod +x /usr/local/bin/intermaven-deploy

intermaven-deploy