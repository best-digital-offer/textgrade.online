document.addEventListener('DOMContentLoaded', function() {
    const textInput = document.getElementById('text-input');
    const analyzeBtn = document.getElementById('analyze-btn');
    const wordCount = document.getElementById('word-count');
    const characterCount = document.getElementById('character-count');
    const sentenceCount = document.getElementById('sentence-count');
    const fleschReadingEase = document.getElementById('flesch-reading-ease');
    const fleschGrade = document.getElementById('flesch-grade');
    const gunningFog = document.getElementById('gunning-fog');
    const smogIndex = document.getElementById('smog-index');
    const gradeFill = document.getElementById('grade-fill');
    const interpretationText = document.getElementById('interpretation-text');
    const sampleButtons = document.querySelectorAll('.sample-btn');
    
    // Sample texts
    const sampleTexts = {
        academic: `The ontological argument for the existence of God, first formulated by Anselm of Canterbury in the 11th century, posits that God, by definition, is that than which nothing greater can be conceived. The argument proceeds from this definition to the necessary existence of God in reality, not merely in the understanding. Subsequent philosophers, including Descartes and Leibniz, developed variations of this argument, while critics such as Kant challenged its logical coherence, particularly objecting to the treatment of existence as a predicate. The ontological argument remains a significant topic in philosophy of religion, engaging contemporary philosophers in debates about modal logic and necessary existence.`,
        
        blog: `Have you ever wondered why some blog posts instantly grab your attention while others make you click away after just a few seconds? The secret often lies in readability. When content is easy to read and understand, people stay longer, engage more, and remember your message. In this post, we'll explore five simple techniques to make your writing more accessible. You'll learn how to structure sentences for maximum impact, choose words that connect with readers, and format your content so it's inviting rather than intimidating. These strategies work whether you're writing for your personal blog, company website, or social media. Let's dive in!`,
        
        children: `Once upon a time, in a little green house at the edge of a big forest, lived a small rabbit named Ruby. Ruby had soft white fur and long, floppy ears. She loved to hop around the garden and munch on crunchy carrots. One sunny morning, Ruby decided to visit her friend Sammy Squirrel. She put on her favorite red bow and hopped down the winding path. Along the way, she saw colorful flowers and heard birds singing happy songs. When Ruby reached the big oak tree where Sammy lived, she found him gathering acorns for winter. "Hello, Sammy!" called Ruby. "Would you like to play hide and seek?" Sammy nodded excitedly. And so their fun day began.`
    };
    
    // Update word count and character count in real-time
    textInput.addEventListener('input', function() {
        const text = textInput.value;
        const words = text.trim() ? text.trim().split(/\s+/) : [];
        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
        
        wordCount.textContent = `Words: ${words.length}`;
        characterCount.textContent = `Characters: ${text.length}`;
        sentenceCount.textContent = `Sentences: ${sentences.length}`;
    });
    
    // Sample text buttons
    sampleButtons.forEach(button => {
        button.addEventListener('click', function() {
            const sampleType = this.getAttribute('data-sample');
            textInput.value = sampleTexts[sampleType];
            textInput.dispatchEvent(new Event('input'));
        });
    });
    
    // Analyze button click
    analyzeBtn.addEventListener('click', function() {
        const text = textInput.value.trim();
        
        if (!text) {
            alert('Please enter some text to analyze.');
            return;
        }
        
        const results = calculateReadability(text);
        
        // Update UI with results
        fleschReadingEase.textContent = results.fleschReadingEase.toFixed(1);
        fleschGrade.textContent = results.fleschGradeLevel.toFixed(1);
        gunningFog.textContent = results.gunningFog.toFixed(1);
        smogIndex.textContent = results.smog.toFixed(1);
        
        // Update grade indicator
        const easePercentage = Math.max(0, Math.min(100, results.fleschReadingEase));
        gradeFill.style.width = `${easePercentage}%`;
        
        // Update interpretation
        interpretationText.textContent = getInterpretation(results);
    });
    
    // Readability calculation functions
    function calculateReadability(text) {
        // Basic text statistics
        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
        const words = text.split(/\s+/).filter(w => w.length > 0);
        const syllables = countSyllables(text);
        
        // Calculate averages
        const avgWordsPerSentence = words.length / sentences.length;
        const avgSyllablesPerWord = syllables / words.length;
        
        // Flesch Reading Ease
        const fleschReadingEase = 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord);
        
        // Flesch-Kincaid Grade Level
        const fleschGradeLevel = (0.39 * avgWordsPerSentence) + (11.8 * avgSyllablesPerWord) - 15.59;
        
        // Gunning Fog Index
        const complexWords = words.filter(word => countSyllablesInWord(word) >= 3).length;
        const percentComplexWords = (complexWords / words.length) * 100;
        const gunningFog = 0.4 * (avgWordsPerSentence + percentComplexWords);
        
        // SMOG Index
        const polysyllables = words.filter(word => countSyllablesInWord(word) >= 3).length;
        const smog = 1.043 * Math.sqrt(polysyllables * (30 / sentences.length)) + 3.1291;
        
        return {
            fleschReadingEase,
            fleschGradeLevel,
            gunningFog,
            smog,
            wordCount: words.length,
            sentenceCount: sentences.length,
            avgWordsPerSentence,
            avgSyllablesPerWord
        };
    }
    
    function countSyllables(text) {
        const words = text.toLowerCase().split(/\s+/);
        return words.reduce((total, word) => total + countSyllablesInWord(word), 0);
    }
    
    function countSyllablesInWord(word) {
        word = word.toLowerCase().replace(/[^a-z]/g, '');
        if (word.length <= 3) return 1;
        
        // Basic syllable counting rules
        let syllables = 0;
        const vowels = 'aeiouy';
        let prevWasVowel = false;
        
        for (let i = 0; i < word.length; i++) {
            const isVowel = vowels.includes(word[i]);
            if (isVowel && !prevWasVowel) {
                syllables++;
            }
            prevWasVowel = isVowel;
        }
        
        // Adjust for common exceptions
        if (word.endsWith('e') && syllables > 1) syllables--;
        if (word.endsWith('le') && !vowels.includes(word[word.length - 3])) syllables++;
        if (syllables === 0) syllables = 1;
        
        return syllables;
    }
    
    function getInterpretation(results) {
        const ease = results.fleschReadingEase;
        const grade = results.fleschGradeLevel;
        
        if (ease >= 90) {
            return `Your text is very easy to read. It's easily understood by an average 11-year-old student (${grade.toFixed(1)} grade level). This is ideal for children's materials, simple instructions, or content targeting readers with basic literacy skills.`;
        } else if (ease >= 80) {
            return `Your text is easy to read. It's suitable for most readers, including those with a 7th to 8th grade education (${grade.toFixed(1)} grade level). This works well for popular fiction, general blog content, and mainstream marketing materials.`;
        } else if (ease >= 70) {
            return `Your text is fairly easy to read. It's appropriate for the general public with an 8th to 9th grade reading level (${grade.toFixed(1)} grade level). This is the recommended level for most web content and general audience publications.`;
        } else if (ease >= 60) {
            return `Your text is at a standard reading level. It's understandable for high school graduates (${grade.toFixed(1)} grade level). This works for quality journalism, professional documents, and academic materials for non-specialists.`;
        } else if (ease >= 50) {
            return `Your text is fairly difficult to read. It's best for college-level readers (${grade.toFixed(1)} grade level). This is appropriate for academic papers, technical documentation, and specialized professional content.`;
        } else if (ease >= 30) {
            return `Your text is difficult to read. It requires university-level education (${grade.toFixed(1)} grade level). This level is typical for academic journals, legal documents, and complex technical manuals.`;
        } else {
            return `Your text is very difficult to read. It's best understood by graduate-level readers (${grade.toFixed(1)} grade level). This extreme complexity is usually only appropriate for highly specialized academic or technical audiences.`;
        }
    }
});