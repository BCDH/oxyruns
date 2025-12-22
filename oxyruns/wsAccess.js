function applicationStarted(pluginWorkspaceAccess) {
  Packages.java.lang.System.err.println(
    "Application started " + pluginWorkspaceAccess
  );

  var projectManager = pluginWorkspaceAccess.getProjectManager();
  var baseToolbarComponents = null;
  var transformationToolbarInfo = null;
  var currentProjectUrl = null;
  var oxyRunsPanel = null;

  // --------------------------------------------------
  // Helper: create a button that runs a transformation
  // --------------------------------------------------
  function createScenarioButton(label, scenarioName) {
    var button = new Packages.javax.swing.JButton(label);
    button.setName("oxyruns-button");

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

  function stripOxyButtons(components) {
    var cleaned = [];
    for (var i = 0; i < components.length; i++) {
      var component = components[i];
      if (!component || component.getName() !== "oxyruns-button") {
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
    if (urlString.indexOf("TEILex0") !== -1) {
      return "TEILex0";
    }
    if (urlString.indexOf("VSK.P") !== -1) {
      return "VSK.P";
    }
    var lastSlash = urlString.lastIndexOf("/");
    var name = lastSlash >= 0 ? urlString.substring(lastSlash + 1) : urlString;
    var dotIndex = name.lastIndexOf(".");
    if (dotIndex > 0) {
      name = name.substring(0, dotIndex);
    }
    return name;
  }

  function getProjectButtonSpecs(projectName) {
    if (projectName == "TEILex0") {
      return [
        {
          label: "Build",
          scenario: "TEILex0: Generate documentation",
        },
        {
          label: "Schema",
          scenario: "TEILex0: ODD to RELAX NG XML",
        },
      ];
    }

    if (projectName == "VSK.P") {
      return [
        {
          label: "V1",
          scenario: "V1",
        },
        {
          label: "V2",
          scenario: "V2",
        },
      ];
    }

    return [
      {
        label: "NB1",
        scenario: "NB1",
      },
      {
        label: "NB2",
        scenario: "NB2",
      },
    ];
  }

  function buildToolbarComponents(originalComponents, projectUrl) {
    var projectName = getProjectName(projectUrl);
    var specs = getProjectButtonSpecs(projectName);
    var panel = new Packages.javax.swing.JPanel();
    panel.setName("oxyruns-panel");
    panel.setLayout(new Packages.java.awt.FlowLayout());
    for (var j = 0; j < specs.length; j++) {
      var spec = specs[j];
      panel.add(createScenarioButton(spec.label, spec.scenario));
    }

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

  function updateOxyRunsPanel(projectUrl) {
    if (!oxyRunsPanel) {
      return;
    }
    var projectName = getProjectName(projectUrl);
    var specs = getProjectButtonSpecs(projectName);
    oxyRunsPanel.removeAll();
    for (var i = 0; i < specs.length; i++) {
      var spec = specs[i];
      oxyRunsPanel.add(createScenarioButton(spec.label, spec.scenario));
    }
    oxyRunsPanel.revalidate();
    oxyRunsPanel.repaint();
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
          baseToolbarComponents = stripOxyButtons(baseComponents);
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
          buildToolbarComponents(baseToolbarComponents, projectUrl || currentProjectUrl)
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
        Packages.java.lang.System.err.println(
          "Project changed: " + oldProjectUrl + " -> " + newProjectUrl
        );
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
