# OxyRuns

OxyRuns is a JavaScript plugin for oXygen XML Editor that adds project-specific
buttons to the transformation toolbar. Each button runs a named transformation
scenario.

This is particularly useful if you want easy access to self-contained transformation scenarios, i.e. scenarios that you'd like to be able to run regardless of the currently selected file in the editor.

![](https://i.imgur.com/rJTdska.png)

## Install

1. Copy or symlink the `oxyruns` folder into your oXygen plugins directory.
   On macOS this is typically: `/Applications/Oxygen XML Editor/plugins/`

   A symlink keeps the plugin pointing at this repo:

   ```bash
   ln -s /Users/ttasovac/Development/BCDH/oxyruns/oxyruns \
     /Applications/Oxygen\ XML\ Editor/plugins/oxyruns
   ```

2. Restart Oxygen.

The plugin loads via `oxyruns/plugin.xml` and the toolbar buttons are populated
from the local config file.

## Configure buttons

Create or edit `oxyruns/oxyruns.config.json` (this file is ignored by Git).
Buttons are shown only for projects listed in `projects`. Each entry is an array
of button definitions:

```json
{
  "projects": {
    "TEILex0": [
      {
        "label": "Build",
        "scenario": "TEILex0: Generate documentation",
        "tooltip": "Generate TEILex0 documentation"
      },
      {
        "label": "Schema",
        "scenario": "TEILex0: ODD to RELAX NG XML",
        "tooltip": "Generate TEILex0 schema"
      }
    ],
  }
}

You can validate your configuration file in oXygen against the JSON Schema file `oxyruns.config.jschema`. 
```

Notes:

- If a project is not listed, no buttons are shown.
- `scenario` must match the exact transformation scenario name in oXygen.
- `tooltip` is optional; omit it to show no tooltip.

After editing the config, restart oXygen to reload buttons.

## Development reference (optional)

For development and further customization, you may want a local copy of the official oXygen `wsaccess`
JavaScript sample plugins to use as reference material:

```bash
mkdir -p upstream
git clone https://github.com/oxygenxml/wsaccess-javascript-sample-plugins.git \
  upstream/oxygen-wsaccess-javascript-sample-plugins
```

To update your local reference copy:

```bash
cd upstream/oxygen-wsaccess-javascript-sample-plugins
git pull
```

This folder is intentionally ignored by Git (see .gitignore) and is not required to use this plugin.
