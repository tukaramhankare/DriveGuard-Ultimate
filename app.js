(() => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------
     Mobile nav toggle
  --------------------------------------------------------- */
  const navToggle = document.getElementById('nav-toggle');
  const siteNav = document.getElementById('site-nav');

  if (navToggle && siteNav) {
    navToggle.addEventListener('click', () => {
      const isOpen = siteNav.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });

    siteNav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        siteNav.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------------------------------------------------------
     Sector grid — dramatizes a drive being hashed
  --------------------------------------------------------- */
  const grid = document.getElementById('sector-grid');

  if (grid) {
    const CELL_COUNT = 96;
    const cells = [];

    // Realistic weighting: most files check out clean, a smaller
    // share are duplicates, and very few are actually corrupted.
    const OUTCOME_WEIGHTS = [
      ['verified', 0.72],
      ['duplicate', 0.21],
      ['corrupt', 0.07],
    ];

    function pickOutcome() {
      const r = Math.random();
      let acc = 0;
      for (const [state, weight] of OUTCOME_WEIGHTS) {
        acc += weight;
        if (r <= acc) return state;
      }
      return 'verified';
    }

    for (let i = 0; i < CELL_COUNT; i++) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.dataset.state = prefersReducedMotion ? pickOutcome() : 'idle';
      grid.appendChild(cell);
      cells.push(cell);
    }

    if (!prefersReducedMotion) {
      const scanOne = () => {
        const idleCells = cells.filter((c) => c.dataset.state === 'idle');
        if (idleCells.length === 0) return;

        const cell = idleCells[Math.floor(Math.random() * idleCells.length)];
        cell.dataset.state = 'scan';

        setTimeout(() => {
          cell.dataset.state = pickOutcome();
        }, 550);
      };

      // Stagger the initial scan so the grid fills in gradually.
      for (let i = 0; i < CELL_COUNT; i++) {
        setTimeout(scanOne, i * 90);
      }

      // Once settled, periodically re-scan a handful of cells so the
      // panel stays quietly alive without being distracting.
      setInterval(() => {
        const settled = cells.filter((c) => c.dataset.state !== 'idle' && c.dataset.state !== 'scan');
        if (settled.length === 0) return;
        const cell = settled[Math.floor(Math.random() * settled.length)];
        cell.dataset.state = 'scan';
        setTimeout(() => {
          cell.dataset.state = pickOutcome();
        }, 550);
      }, 1400);
    }
  }

  /* ---------------------------------------------------------
     Terminal log demo
  --------------------------------------------------------- */
  const terminalBody = document.getElementById('terminal-body');

  if (terminalBody) {
    const LOG_LINES = [
      { text: '14:02:11  SCAN STARTED   D:\\Backup\\Photos          2,481 files', cls: 'line-dim' },
      { text: '14:02:14  HASH OK        IMG_2041.jpg              9c1f2a44…', cls: 'line-verified' },
      { text: '14:02:14  DUPLICATE      IMG_2041_copy.jpg         9c1f2a44…  → matches IMG_2041.jpg', cls: 'line-duplicate' },
      { text: '14:02:19  HASH OK        Invoice_March.pdf         5e0b7dd1…', cls: 'line-verified' },
      { text: '14:02:23  CORRUPTED      export_final.mov          checksum mismatch', cls: 'line-corrupt' },
      { text: '14:02:31  SCAN COMPLETE  2,481 files · 1 duplicate · 1 corrupted', cls: 'line-dim' },
    ];

    function renderLine(line) {
      const span = document.createElement('span');
      span.className = line.cls;
      span.textContent = line.text;
      terminalBody.appendChild(span);
      terminalBody.appendChild(document.createTextNode('\n'));
    }

    if (prefersReducedMotion) {
      LOG_LINES.forEach(renderLine);
    } else {
      let i = 0;
      const revealNext = () => {
        if (i >= LOG_LINES.length) return;
        renderLine(LOG_LINES[i]);
        i++;
        setTimeout(revealNext, 480);
      };
      revealNext();
    }
  }

  /* ---------------------------------------------------------
     Copy download link
  --------------------------------------------------------- */
  const copyBtn = document.getElementById('copy-link-btn');
  const downloadBtn2 = document.getElementById('download-btn-2');

  if (copyBtn && downloadBtn2) {
    copyBtn.addEventListener('click', async () => {
      const url = downloadBtn2.href;
      try {
        await navigator.clipboard.writeText(url);
        copyBtn.textContent = 'Link copied';
      } catch (err) {
        copyBtn.textContent = 'Copy failed — copy manually';
      }
      setTimeout(() => {
        copyBtn.textContent = copyBtn.dataset.defaultLabel;
      }, 2000);
    });
  }

  /* ---------------------------------------------------------
     Footer year
  --------------------------------------------------------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
