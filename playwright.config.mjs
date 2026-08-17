import {defineConfig,devices} from '@playwright/test';
export default defineConfig({
  testDir:'tests/e2e',
  timeout:30000,
  retries:2,
  workers:1,
  reporter:'line',
  use:{baseURL:'http://127.0.0.1:4173',trace:'retain-on-failure',screenshot:'only-on-failure',video:'retain-on-failure'},
  projects:[
    {name:'desktop-chrome',use:{...devices['Desktop Chrome']}},
    {name:'mobile-chrome',use:{...devices['Pixel 7']}}
  ],
  webServer:{command:'python3 -m http.server 4173 --bind 127.0.0.1',url:'http://127.0.0.1:4173',reuseExistingServer:false,timeout:30000}
});
