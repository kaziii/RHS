[![Build Status](https://travis-ci.org/AutoSponge/json-extend.svg)](https://travis-ci.org/AutoSponge/json-extend)
[![Code Climate](https://codeclimate.com/repos/54cdad4ee30ba0734800092c/badges/5398bce4f37f24e5cbb4/gpa.svg)](https://codeclimate.com/repos/54cdad4ee30ba0734800092c/feed)
[![Test Coverage](https://codeclimate.com/repos/54cdad4ee30ba0734800092c/badges/5398bce4f37f24e5cbb4/coverage.svg)](https://codeclimate.com/repos/54cdad4ee30ba0734800092c/feed)

# json-extend

Deep extend utility designed for use with JSON data.

Syntax: `extend ( target, object1[, objectN] )`

Extend one object with one or more others, returning the modified object.

# Why this utility

If you use JSON APIs to populate your app models, there are a fewer types to deal with,
so this library can optimize for handling just those cases (Object, Array, Boolean, String, Number, and null).
