# ATS check

Local ATS simulation for the resume PDF. It extracts the PDF text with
[`pdf-parse`](https://www.npmjs.com/package/pdf-parse) and scores it with
[`@pranavraut033/ats-checker`](https://www.npmjs.com/package/@pranavraut033/ats-checker)
(deterministic, no network calls, nothing leaves your machine).

This is an approximation, not a real Workday/Greenhouse/Lever run. Use it to catch
parsing problems and keyword gaps, not as a verdict.

## Usage

```bash
cd ats
npm install
# compile the resume first so the PDF exists (the PDF is git-ignored)
npm run check                                   # ../Miguel Avila - Resume.pdf vs jd/software-engineer.txt
npm run check:text                              # also prints the extracted text
node check.mjs other.pdf --jd jd/other-job.txt  # custom PDF / job description
```

Paste a real job posting into `jd/` and pass it with `--jd` to score against that role.

## Reading the output

- **parseability**: formatting problems (tables, columns, odd bullets, unreadable contact info).
- **skills / keywords**: coverage of the job description's requirements.
- **experience**: the profile's minimum years is set to 0 because this is an internship resume.

## Known limitations

- Skill matching is heuristic. It can report a skill as missing even when it is on the page
  (for example `javascript`, which is in the Technical Skills row). Check `--text` before changing the resume.
- Scores depend on the job description you use.
