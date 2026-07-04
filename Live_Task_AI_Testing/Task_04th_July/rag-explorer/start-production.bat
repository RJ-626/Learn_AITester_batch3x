@echo off
echo Starting RAG Explorer in production mode...
cd /d "C:\Users\DELL\OneDrive\Documents\AITesterBlueprint3x\Live_Task_AI_Testing\Task_04th_July\rag-explorer"
if not exist "dist\" (
  echo Building React frontend first...
  call npm run build
)
call npm start
