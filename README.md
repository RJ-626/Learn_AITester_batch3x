# Learn_AITester_batch3x

A practical, project-driven curriculum for QA engineers learning to use LLMs as a real testing tool — not a toy.
Each chapter pairs concept material with a hands-on project, a prompt template, and runnable code where applicable.

- **Author:** Rahul Jaiswal

---

## Repository Layout

```
.
├── chapter_01_LLM_Basics/         How transformers and attention work
│   ├── attention_interactive.html
│   ├── attention_is_all_you_need.html
│   └── Notes.md
│
├── chapter_02_Prompt_Eng/         Prompt engineering for QA work
│   ├── Anti_Hallucinations_Rules.md
│   ├── Project1_Test_Case_Generation/  Test case generation from a PRD/API doc
│   │   ├── RICE-POT-TestCase-Prompt.md
│   │   ├── RICE_POT_FRAMEWORK/
│   │   ├── Restful-booker.pdf
│   │   ├── Restful_Booker_API_Test_Cases.md
│   │   └── output/
│   ├── Project2_Selenium_Framework/   POM-based Selenium framework built from a prompt
│   │   ├── pom.xml
│   │   ├── src/test/java/pages/
│   │   └── src/test/java/tests/
│   └── templates/                 Reusable prompt templates (RTCFR / RICE-POT)
│       ├── 01_TestCaseGeneration_Prompt.md
│       ├── 02_TestCases_from_prd
│       ├── 03_API_Test_Generation.md
│       ├── 04_Negative_TC_Only.md
│       ├── 05_Secuirty_Test.md
│       └── 06_Regression_Suite.md
│
└── Live_Task_AI_Testing/          Live class tasks and real-time projects
    ├── Task_23rd_May/
    └── Task_24th_May/
        ├── Rest_assured_testing_framework/  Maven + TestNG + REST Assured
        │   ├── pom.xml
        │   ├── src/test/java/pages/
        │   ├── src/test/java/tests/
        │   └── src/test/resources/testng.xml
        └── Test_plan_creation_with_local_LLM/
        │   └── Restful_Booker_Test_Plan.pdf
```

---

## Chapter 01 — LLM Basics

Foundational material on how Large Language Models read text and decide what to output. The key idea: a model is not a database lookup — it weighs every token against every other token (attention) and predicts the next one.

**What's here:**
- `attention_is_all_you_need.html` — interactive walkthrough of the original Transformer paper concepts.
- `attention_interactive.html` — visualises self-attention so you can see why prompt phrasing changes outputs.
- `Notes.md` — short recap notes.

**Why a QA engineer should care:** the model's behaviour is deterministic-ish on a per-token level, but every word you add to a prompt shifts the attention weights. That is why structured prompt frameworks (next chapter) outperform free-form questions.

Open the HTML files locally in any browser — no build step.

---

## Chapter 02 — Prompt Engineering for QA

This chapter turns prompt engineering into a repeatable QA skill. Three pillars:

1. **Anti-hallucination rules** — guardrails so the model only uses provided input.
2. **RICE-POT framework** — a structured prompt template (Role, Instructions, Context, Example, Parameters, Output, Tone).
3. **Two projects + six templates** — applied on real artifacts (a PRD-style API doc and a Selenium framework build).

### Anti-Hallucination Rules (`Anti_Hallucinations_Rules.md`)

A drop-in `ROLE` block you prepend to any QA prompt. Forces the model to:
- Use only the inputs you provide (PRD, screenshots, API docs).
- Refuse to assume "typical" system behaviour.
- Output exactly `"Insufficient information to determine."` when an input is missing.
- Label inferred details as `"Inference (low confidence)"`.
- Produce a Verified Facts / Missing Info / Output / Self-Validation block.

Use this on every factual-generation prompt in this repo.

### Project 1 — Test Case Generation with RICE-POT

Goal: turn an API PDF (`Restful-booker.pdf`) into a CSV of enterprise-grade test cases.

- `RICE-POT-TestCase-Prompt.md` — the worked prompt. Targets `app.vwo.com` as the example product, but the structure transfers to any PRD/API doc.
- `RICE_POT_FRAMEWORK/RICE_POT.md` — explanation of each letter of the framework.
- `Restful-booker.pdf` + `Restful_Booker_API_Test_Cases.md` — input PDF and the generated test-case set.
- `output/deepseek_csv_20260524_0d9b7c.csv` — actual model output produced from the prompt.

**How to exercise it:**
1. Open `RICE-POT-TestCase-Prompt.md` in any AI tool (ChatGPT, Claude, Gemini, DeepSeek).
2. Attach `Restful-booker.pdf` (or your own PRD).
3. Confirm the output is CSV only, columns match the spec, and every test case traces back to the PDF.

### Project 2 — Selenium Framework from a Prompt

Goal: prove RICE-POT can build production code, not just test cases.

- `pom.xml` — Maven project with Selenium 4, TestNG.
- `src/test/java/pages/` — Page Object Model (POM) classes (`AccountPage.java`, `AuthPage.java`).
- `src/test/java/tests/` — TestNG test classes (`AuthTest.java`).

**Run it:**
```bash
cd chapter_02_Prompt_Eng/Project2_Selenium_Framework
mvn -q clean test-compile
mvn test
```

### Templates — RTCFR + RICE-POT (`templates/`)

Six copy-paste prompt templates for the most common QA tasks. Each follows the **RTCFR** shape — Role, Task, Constraints, Format, Requirements — which is the lightweight cousin of RICE-POT.

| # | File | Purpose |
|---|---|------|
| 01 | `01_TestCaseGeneration_Prompt.md` | Basic test-case generation from free-form requirements. |
| 02 | `02_TestCases_from_prd` | Comprehensive PRD → test cases (functional, negative, boundary, edge). |
| 03 | `03_API_Test_Generation.md` | API endpoint test cases from API docs. |
| 04 | `04_Negative_TC_Only.md` | Negative-only suite — invalid inputs, auth violations, malformed data. |
| 05 | `05_Secuirty_Test.md` | OWASP-top-10-aligned security test cases. |
| 06 | `06_Regression_Suite.md` | Regression suite for a module with execution-time estimates. |

**Use any template:**
1. Open the file and copy the fenced block.
2. Replace `[FEATURE]` / `[PASTE REQUIREMENTS]` / `[PASTE PRD]` etc. with your input.
3. Paste into your AI tool. Keep the `CONSTRAINTS` block intact — that's what stops hallucination.

---

## Live Tasks — AI Testing in Practice

Real-time class tasks and assignments built during the live sessions.

### Task 23rd May
Introductory live task content.

### Task 24th May

- **REST Assured Testing Framework** (`Live_Task_AI_Testing/Task_24th_May/Rest_assured_testing_framework/`)
  - Maven + TestNG + REST Assured setup.
  - Page classes: `AccountPage.java`, `AuthPage.java`.
  - Test classes: `AccountTest.java`, `AuthTest.java`.
  - `testng.xml` for suite configuration.
  - **Run it:**
    ```bash
    cd Live_Task_AI_Testing/Task_24th_May/Rest_assured_testing_framework
    mvn -q clean test-compile
    mvn test
    ```

- **Test Plan Creation with Local LLM** (`Live_Task_AI_Testing/Task_24th_May/Test_plan_creation_with_local_LLM/`)
  - `Restful_Booker_Test_Plan.pdf` — generated test plan and documentation using local LLM models.

---

## How to Use This Repo

You can read it linearly (chapter 01 → 02) or jump straight to a project:

- **"I want better test cases now."** → `chapter_02_Prompt_Eng/templates/01_TestCaseGeneration_Prompt.md` or `02_TestCases_from_prd`.
- **"I want to write tests from a PDF/API doc."** → `chapter_02_Prompt_Eng/Project1_Test_Case_Generation/`.
- **"I want to scaffold a Selenium project."** → `chapter_02_Prompt_Eng/Project2_Selenium_Framework/`.
- **"I want my model to stop making things up."** → `chapter_02_Prompt_Eng/Anti_Hallucinations_Rules.md`.

## Requirements

- Any modern LLM (Claude / GPT / Gemini / DeepSeek). No specific provider required.
- For runnable projects (Selenium Framework, REST Assured Framework): **JDK 11+** and **Maven 3.9+**.

## Recent Commits

- `7335a97` — Added Task 24th May: REST Assured framework, Selenium framework, test plan creation with local LLM, and reorganized Project1 to `Project1_Test_Case_Generation`.
- `d5821b5` — Merge branch 'main'.
- `8fa65a0` — Added Live_Task_AI_Testing directory with Task_23rd_May.
- `0b60433` — Renamed project to Learn_AITester_batch3x.
- `f64e1e5` — Added README + .gitignore; reorganized chapter 02 with prompt templates.
- `dfe2653` — Added chapter 02 prompt engineering with RICE-POT framework + Selenium project.
- `a2eb280` — Added chapter 01 LLM basics with interactive attention visualisations.

---

Made by [Pramod Dutta](https://thetestingacademy.com/) for The Testing Academy.
