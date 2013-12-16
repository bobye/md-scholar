Markdown Scholar
================
*author: [bobye](http://github.com/bobye/)*

### Introduction
[Pencil++](https://github.com/bobye/pencil) is a branch forked from [pencil](https://github.com/asleepysamurai/pencil). I created this for my own scholar managements, e.g. taking research notes, record dirty-and-quick tips and share knowledges. It integrates with 
 - ACE, an embedded markdown editor
 - marked, with a bit revision
 - nodejs + expressjs

### Basic Usages
 - [Start a new scratch](http://pencil.jianbo.ws)
 - Meta-P : switch between editing and preview modes
 - Meta-S : save current buffer
 - Ctrl-S : create a new private note and copy current buffer to the note. (Registered user only)

### How to Cite 
Pencil++ currently only supports [dblp](http://dblp.org/) and [arxiv](http://arxiv.org/), sample uses are as follows 
 * This is a DBLP IEEE journal citation {dblp:journals/pami/LiW08}.
 * And this is a DBLP ACM conference citation {dblp:conf/mm/LuSALNW12}.
 * Yet another citation from arXiv {arxiv:1312.0750} with journal references

### Todo List
 * ~~Enhance embedded markdown editor using [ACE](http://ace.c9.io/).~~
 * Call for book citation (candidates: douban, springer, or other ISBN database).
 * Grab bib from ACM/IEEE, if applicable
 * Try to import bibtex and export them at once.
 * Improve file management
 * ~~Add user auth~~
 * Add more supports for bib databases and, if possible, Google scholar

### Resources
 * [Scholarly APIs](http://libguides.mit.edu/apis)
 * [ISBNdb.com](http://isbndb.com/api/v2/docs/books): limited to 500 queries per day.
 * douban api


It may have some bugs, please contact me to fix them. _Have fun!_ 


