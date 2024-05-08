# aolney_jupyterlab_blockly_python_extension

[![Github Actions Status](https://github.com/aolney/jupyterlab-blockly-python-extension/workflows/Build/badge.svg)](https://github.com/aolney/jupyterlab-blockly-python-extension/actions/workflows/build.yml)[![Binder](https://mybinder.org/badge_logo.svg)](https://mybinder.org/v2/gh/aolney/jupyterlab-blockly-python-extension/main?urlpath=lab)
A JupyterLab extension implementing a Blockly palette for the `Python` language.
For data science training materials using this extension, see [here](https://github.com/memphis-iis/datawhys-content-notebooks-python).
For an `R` extension with the same Blockly functionality, see [here](https://github.com/aolney/jupyterlab-blockly-r-extension).

The following query string parameters enable functionality:

- bl=py forces the extension to display on load (it is already active)
- log=xxx specifies a url for a logging endpoint (e.g. https://yourdomain.com/log)
- id=xxx adds an identifier for logging


> [!WARNING]  
> Currently there appears to be a conflict between the Python and R extensions, so we recommend that only one be installed at a time.
> Additionally the current version of nbgitpuller is removing the query strings above before they can be processed.

## Requirements

- JupyterLab >= 4.0.0

*An earlier version targets JupyterLab 1.2x. You can find that version on [npm](https://www.npmjs.com/package/@aolney/jupyterlab-blockly-python-extension) and in the commit history of this repository ([final tag](https://github.com/aolney/jupyterlab-blockly-python-extension/releases/tag/0.5.6))*

## Install

To install the extension, execute:

```bash
pip install aolney_jupyterlab_blockly_python_extension
```

## Uninstall

To remove the extension, execute:

```bash
pip uninstall aolney_jupyterlab_blockly_python_extension
```

## Contributing

- Andrew Olney
- Luiz Barboza

### Development install

Creating a virtual environment is recommended:

```
    curl -L -O "https://github.com/conda-forge/miniforge/releases/latest/download/Miniforge3-$(uname)-$(uname -m).sh"
    bash Miniforge3-$(uname)-$(uname -m).sh

    mamba create -n dev jupyterlab=4 nodejs=18 git copier=7 jinja2-time

    /home/ubuntu/miniforge3/bin/mamba init

    mamba activate dev

    mamba install -c conda-forge jupyterlab
```

Note: You will need NodeJS to build the extension package.

The `jlpm` command is JupyterLab's pinned version of
[yarn](https://yarnpkg.com/) that is installed with JupyterLab. You may use
`yarn` or `npm` in lieu of `jlpm` below.

```bash
# Clone the repo to your local environment
# Change directory to the aolney_jupyterlab_blockly_python_extension directory
# Install package in development mode
pip install -e "."
# Link your development version of the extension with JupyterLab
jupyter labextension develop . --overwrite
# Rebuild extension Typescript source after making changes
jlpm build
```

You can watch the source directory and run JupyterLab at the same time in different terminals to watch for changes in the extension's source and automatically rebuild the extension.

```bash
# Watch the source directory in one terminal, automatically rebuilding when needed
jlpm watch
# Run JupyterLab in another terminal
jupyter lab
```

*The watch.sh script runs JupyterLab in watch mode with the Chrome browser*

With the watch command running, every saved change will immediately be built locally and available in your running JupyterLab. Refresh JupyterLab to load the change in your browser (you may need to wait several seconds for the extension to be rebuilt).

By default, the `jlpm build` command generates the source maps for this extension to make it easier to debug using the browser dev tools. To also generate source maps for the JupyterLab core extensions, you can run the following command:

```bash
jupyter lab build --minimize=False
```

### Development uninstall

```bash
pip uninstall aolney_jupyterlab_blockly_python_extension
```

In development mode, you will also need to remove the symlink created by `jupyter labextension develop`
command. To find its location, you can run `jupyter labextension list` to figure out where the `labextensions`
folder is located. Then you can remove the symlink named `@aolney/jupyterlab-blockly-python-extension` within that folder.

### Testing the extension

#### Frontend tests

This extension is using [Jest](https://jestjs.io/) for JavaScript code testing.

To execute them, execute:

```sh
jlpm
jlpm test
```

#### Integration tests

This extension uses [Playwright](https://playwright.dev/docs/intro) for the integration tests (aka user level tests).
More precisely, the JupyterLab helper [Galata](https://github.com/jupyterlab/jupyterlab/tree/master/galata) is used to handle testing the extension in JupyterLab.

More information are provided within the [ui-tests](./ui-tests/README.md) README.

### Packaging the extension

See [RELEASE](RELEASE.md)
