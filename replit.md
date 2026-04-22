# Replit Agent Skills Library

## Overview
This is the Replit Agent Skills Library — a repository of modular skill definitions used by the Replit Agent platform. Skills are structured markdown files that define agent capabilities across a wide range of tasks.

## Project Structure

- `.local/skills/` — Core agent skills (37 skills including workflows, database, deployment, canvas, etc.)
- `.local/secondary_skills/` — Domain-specific skills (meal planner, stock analyzer, travel assistant, etc.)
- `.local/state/` — Persistent agent state storage
- `.agents/` — Agent instance metadata
- `server.py` — Simple Python HTTP server that displays the skills library at port 5000

## Running the Application

The application is a static skills browser served by a Python HTTP server.

**Start command:** `python server.py`  
**Port:** 5000

## Architecture

- **Frontend:** Plain HTML/CSS served dynamically by Python's built-in HTTP server
- **Backend:** Python `http.server` module (no external dependencies)
- **Data:** Skills are read directly from the `.local/` directory at runtime

## Skills Categories

### Core Skills
Development tools, integrations, design, deployment, database management, and platform-specific capabilities.

### Domain Skills  
Specialized task skills like resume building, meal planning, stock analysis, SEO auditing, and more.
