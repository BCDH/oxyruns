function applicationStarted(pluginWorkspaceAccess) {
  var projectManager = pluginWorkspaceAccess.getProjectManager();
  var baseToolbarComponents = null;
  var transformationToolbarInfo = null;
  var currentProjectUrl = null;
  var oxyRunsPanel = null;
  var config = loadConfig();

  // --------------------------------------------------
  // Helper: create a button that runs a transformation
  // --------------------------------------------------
  function createScenarioButton(label, scenarioName) {
    var button = new Packages.javax.swing.JButton(label);

    var action = {
      actionPerformed: function (e) {
        var editorAccess = pluginWorkspaceAccess.getCurrentEditorAccess(
          Packages.ro.sync.exml.workspace.api.standalone
            .StandalonePluginWorkspace.MAIN_EDITING_AREA
        );
        try {
          var scenarios = new java.lang.reflect.Array.newInstance(
            Packages.java.lang.String,
            1
          );
          scenarios[0] = scenarioName;
          editorAccess.runTransformationScenarios(scenarios, null);
        } catch (e1) {
          e1.printStackTrace();
        }
      },
    };

    button.addActionListener(
      new JavaAdapter(Packages.java.awt.event.ActionListener, action)
    );

    return button;
  }

  function stripOxyRunsComponents(components) {
    var cleaned = [];
    for (var i = 0; i < components.length; i++) {
      var component = components[i];
      if (!component || component.getName() !== "oxyruns-panel") {
        cleaned.push(component);
      }
    }
    var array = new java.lang.reflect.Array.newInstance(
      Packages.javax.swing.JComponent,
      cleaned.length
    );
    for (var j = 0; j < cleaned.length; j++) {
      array[j] = cleaned[j];
    }
    return array;
  }

  function getProjectName(projectUrl) {
    if (!projectUrl) {
      return "";
    }

    var urlString = projectUrl.toString();
    var lastSlash = urlString.lastIndexOf("/");
    var name = lastSlash >= 0 ? urlString.substring(lastSlash + 1) : urlString;
    var dotIndex = name.lastIndexOf(".");
    if (dotIndex > 0) {
      name = name.substring(0, dotIndex);
    }
    return name;
  }

  function loadConfig() {
    var defaults = {
      default: [
        { label: "NB1", scenario: "NB1" },
        { label: "NB2", scenario: "NB2" },
      ],
      projects: {},
    };

    try {
      var configUrl = new Packages.java.net.URL(
        jsDirURL.toString() + "/oxyruns.config.json"
      );
      var reader = new Packages.java.io.BufferedReader(
        new Packages.java.io.InputStreamReader(configUrl.openStream(), "UTF-8")
      );
      var line;
      var content = "";
      while ((line = reader.readLine()) !== null) {
        content += line;
      }
      reader.close();
      var parsed = JSON.parse(content);
      return parsed || defaults;
    } catch (e) {
      return defaults;
    }
  }

  function findProjectKey(projectUrl) {
    if (!projectUrl || !config || !config.projects) {
      return "";
    }
    var urlString = projectUrl.toString();
    var name = getProjectName(projectUrl);
    if (config.projects[name]) {
      return name;
    }
    for (var key in config.projects) {
      if (Object.prototype.hasOwnProperty.call(config.projects, key)) {
        if (urlString.indexOf(key) !== -1) {
          return key;
        }
      }
    }
    return "";
  }

  function getProjectButtonSpecs(projectUrl) {
    if (config && config.projects) {
      var key = findProjectKey(projectUrl);
      if (key && config.projects[key]) {
        return config.projects[key];
      }
    }
    return config && config.default ? config.default : [];
  }

  function buildToolbarComponents(originalComponents, projectUrl) {
    var specs = getProjectButtonSpecs(projectUrl);
    var panel = new Packages.javax.swing.JPanel(new Packages.java.awt.FlowLayout());
    panel.setName("oxyruns-panel");
    updateOxyRunsPanelContents(panel, specs);

    var all = new java.lang.reflect.Array.newInstance(
      Packages.javax.swing.JComponent,
      originalComponents.length + 1
    );
    for (var i = 0; i < originalComponents.length; i++) {
      all[i] = originalComponents[i];
    }
    all[originalComponents.length] = panel;
    oxyRunsPanel = panel;
    return all;
  }

  function updateOxyRunsPanelContents(panel, specs) {
    panel.removeAll();
    for (var i = 0; i < specs.length; i++) {
      var spec = specs[i];
      panel.add(createScenarioButton(spec.label, spec.scenario));
    }
    panel.revalidate();
    panel.repaint();
  }

  function resolveCurrentProjectUrl() {
    if (currentProjectUrl) {
      return currentProjectUrl;
    }
    try {
      return projectManager ? projectManager.getCurrentProjectURL() : null;
    } catch (e) {
      return null;
    }
  }

  function updateOxyRunsPanel(projectUrl) {
    if (!oxyRunsPanel) {
      return;
    }
    var specs = getProjectButtonSpecs(projectUrl);
    updateOxyRunsPanelContents(oxyRunsPanel, specs);
  }

  // --------------------------------------------------
  // Toolbar customizer
  // --------------------------------------------------
  toolbarCustomizer = {
    customizeToolbar: function (toolbarInfo) {
      if ("Transformation" == toolbarInfo.getToolbarID()) {
        Packages.java.lang.System.err.println(
          "Customizing toolbar: " + toolbarInfo.getToolbarID()
        );

        transformationToolbarInfo = toolbarInfo;
        var baseComponents = toolbarInfo.getComponents();
        if (!baseToolbarComponents) {
          baseToolbarComponents = stripOxyRunsComponents(baseComponents);
        } else {
          baseToolbarComponents = stripOxyRunsComponents(baseComponents);
        }
        var projectUrl = null;
        try {
          projectUrl = projectManager
            ? projectManager.getCurrentProjectURL()
            : null;
        } catch (e) {
          projectUrl = null;
        }
        if (projectUrl) {
          currentProjectUrl = projectUrl;
        }
        toolbarInfo.setComponents(
          buildToolbarComponents(
            baseToolbarComponents,
            projectUrl || resolveCurrentProjectUrl()
          )
        );
      }
    },
  };

  toolbarCustomizer = new JavaAdapter(
    Packages.ro.sync.exml.workspace.api.standalone.ToolbarComponentsCustomizer,
    toolbarCustomizer
  );

  pluginWorkspaceAccess.addToolbarComponentsCustomizer(toolbarCustomizer);

  var projectChangeListener = new JavaAdapter(
    Packages.ro.sync.exml.workspace.api.standalone.project.ProjectChangeListener,
    {
      projectChanged: function (oldProjectUrl, newProjectUrl) {
        currentProjectUrl = newProjectUrl;
        updateOxyRunsPanel(newProjectUrl);
      },
    }
  );

  projectManager.addProjectChangeListener(projectChangeListener);
}

function applicationClosing(pluginWorkspaceAccess) {
  Packages.java.lang.System.err.println(
    "Application closing " + pluginWorkspaceAccess
  );
}
