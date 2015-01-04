#! /usr/bin/env node

var dictionary = require('./dictionary.json');

var vowels = 0,
    consonants = 0;

for(var word in dictionary.words) {
    for(var letter in word) {
        if("aeiouy".indexOf(word[letter]) != -1) {
            ++vowels;
        } else {
            ++consonants;
        }
    }
}

console.log("Vowels: " + vowels.toString() + ", Consonants: " + consonants.toString());
