#!/usr/bin/env python
# -*- coding: utf-8 -*-
import setuptools

setuptools.setup(
    name='decrypto',
    version='0.0.1',
    description='Decrypto multiplayer backend',
    author='Cory Nezin',
    packages=setuptools.find_packages(),
    install_requires=['flask-socketio', 'eventlet'],
)
