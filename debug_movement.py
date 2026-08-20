import asyncio
from pathlib import Path
from playwright.async_api import async_playwright
import json
import os

SCREENSHOTS = Path("/tmp/browser/debug_movement")
SCREENSHOTS.mkdir(parents=True, exist_ok=True)

async def main():
    async with async_playwright() as playwright:
        browser = await playwright.chromium.launch(headless=True)
        context = await browser.new_context(viewport={"width": 1280, "height": 1800})
        page = await context.new_page()

        # Check LOVABLE_BROWSER_AUTH_STATUS
        auth_status = os.environ.get("LOVABLE_BROWSER_AUTH_STATUS")
        print(f"Auth status: {auth_status}")

        if auth_status == "injected":
            storage_key = os.environ.get("LOVABLE_BROWSER_SUPABASE_STORAGE_KEY")
            session_json = os.environ.get("LOVABLE_BROWSER_SUPABASE_SESSION_JSON")
            cookies_json = os.environ.get("LOVABLE_BROWSER_SUPABASE_COOKIES_JSON")

            if cookies_json:
                cookies = json.loads(cookies_json)
                for c in cookies:
                    c["url"] = "http://localhost:8080"
                await context.add_cookies(cookies)

            await page.goto("http://localhost:8080")
            if storage_key and session_json:
                await page.evaluate(
                    f"window.localStorage.setItem({json.dumps(storage_key)}, {json.dumps(session_json)})"
                )
        
        # Navigate to room
        await page.goto("http://localhost:8080/room", wait_until="networkidle")
        await page.wait_for_timeout(2000) # Wait for profile load
        
        await page.screenshot(path=str(SCREENSHOTS / "1_room_loaded.png"))
        
        # Try to click a tile
        # The tiles are .iso-tile
        tiles = await page.query_selector_all(".iso-tile")
        if tiles:
            print(f"Found {len(tiles)} tiles")
            # Click a tile far away from center (center is usually 5,5)
            # Assuming 10x10, tile at index 88 should be around (8,8)
            await tiles[88].click()
            await page.wait_for_timeout(1000)
            await page.screenshot(path=str(SCREENSHOTS / "2_after_click.png"))
            
            # Check for console errors
            logs = await page.evaluate("() => window.console_logs || []")
            print("Console logs:", logs)
        else:
            print("No tiles found")

        await browser.close()

asyncio.run(main())
