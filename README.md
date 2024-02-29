
# V4 Instalation Process

## To install the environment: JupyterLab on Mamba
```
    curl -L -O "https://github.com/conda-forge/miniforge/releases/latest/download/Miniforge3-$(uname)-$(uname -m).sh"
    bash Miniforge3-$(uname)-$(uname -m).sh

    mamba create -n dev jupyterlab=4 nodejs=18 git copier=7 jinja2-time

    /home/ubuntu/miniforge3/bin/mamba init

    mamba activate dev

    mamba install -c conda-forge jupyterlab

```

## To Create a new extension
```
    mkdir blockly

    cd blockly

    copier copy https://github.com/jupyterlab/extension-template .

    pip install -ve .

    jupyter labextension develop --overwrite .

    jlpm install

    jlpm add @jupyterlab/apputils @jupyterlab/application @lumino/widgets

    jlpm run build


```

## To Compile the App 
```
    copy the scr files into the blockly extension folder

    npm install

    npm add blockly

    jlpm run build

```

# To Start the server 
```
    jupyter lab
 
```






