import {test,expect} from '@playwright/test';

const fixture=`Monday,09:00-10:00,Artificial Intelligence @ Faculty A,Room A\n,,\nMonday,11:00-12:00,Database Systems @ Faculty B,Room B\nTuesday,10:00-11:30,Computer Networks @ Faculty C,Room C\nWednesday,14:00-15:00,Deep Learning @ Faculty D,Room D\n`;

test.beforeEach(async({page})=>{
  await page.route('https://docs.google.com/spreadsheets/**',async route=>route.fulfill({status:200,contentType:'text/csv',body:fixture}));
  await page.goto('/');
  await page.waitForFunction(()=>window.SaiU&&Array.isArray(window.SaiU.timetable));
});

test('home renders live timetable controls and navigation',async({page})=>{
  await expect(page).toHaveTitle('SaiU V2');
  await expect(page.locator('#main')).toContainText('Personal timetable');
  await expect(page.locator('#main')).toContainText('Live source');
  await page.getByRole('button',{name:'Timetable'}).click();
  await expect(page.locator('#main')).toContainText('Timetable');
});

test('AI local-first flow answers a timetable question without a provider',async({page})=>{
  await page.getByRole('button',{name:'Ask AI'}).click();
  const input=page.locator('#aiInput');
  await input.fill('What is my schedule today?');
  await page.getByRole('button',{name:'Ask',exact:true}).click();
  await expect(page.locator('#aiAnswer')).not.toContainText('Thinking…');
  await expect(page.locator('#aiAnswer')).toContainText(/Monday|Tuesday|Wednesday|Thursday|Friday|no classes/i);
});

test('planner accepts and completes a task',async({page})=>{
  await page.getByRole('button',{name:'Planner'}).click();
  await page.locator('#taskInput').fill('Finish production audit');
  await page.getByRole('button',{name:'Add',exact:true}).click();
  await expect(page.locator('#main')).toContainText('Finish production audit');
  await page.locator('[data-task]').last().check();
  await expect(page.locator('#main')).toContainText(/done/i);
});

test('security and accessibility baseline hold in a real browser',async({page})=>{
  const csp=await page.locator('meta[http-equiv="Content-Security-Policy"]').getAttribute('content');
  expect(csp).toContain("script-src 'self'");
  await expect(page.getByRole('navigation',{name:'Primary navigation'})).toBeVisible();
  await expect(page.locator('main#main')).toHaveAttribute('tabindex','-1');
});
