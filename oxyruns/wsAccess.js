function applicationStarted(pluginWorkspaceAccess) {
  Packages.java.lang.System.err.println(
    "Application started " + pluginWorkspaceAccess
  );

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
      }
    }

    button.addActionListener(
      new JavaAdapter(Packages.java.awt.event.ActionListener, action)
    );

    return button;
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

        var original = toolbarInfo.getComponents();
        var all = new java.lang.reflect.Array.newInstance(
          Packages.javax.swing.JComponent,
          original.length + 2
        );

        for (var i = 0; i < original.length; i++) {
          all[i] = original[i];
        }

        // Create buttons
        var buildButton = createScenarioButton(
          "Build",
          "TEILex0: Generate documentation"
        );

        var schemaButton = createScenarioButton(
          "Schema",
          "TEILex0: ODD to RELAX NG XML"
        );

        // Add buttons to toolbar
        all[original.length] = buildButton;
        all[original.length + 1] = schemaButton;

        toolbarInfo.setComponents(all);
      }
    }
  };

  toolbarCustomizer = new JavaAdapter(
    Packages.ro.sync.exml.workspace.api.standalone.ToolbarComponentsCustomizer,
    toolbarCustomizer
  );

  pluginWorkspaceAccess.addToolbarComponentsCustomizer(toolbarCustomizer);
}

function applicationClosing(pluginWorkspaceAccess) {
  Packages.java.lang.System.err.println(
    "Application closing " + pluginWorkspaceAccess
  );
}
