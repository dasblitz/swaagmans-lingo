//play a middle 'C' for the duration of an 8th note
//create a synth and connect it to the main output (your speakers)
const synth = new Tone.Synth({
envelope : {
attack : 0.005 ,
decay : 0.2 ,
sustain : 0.2 ,
release : 0.8
}}).toDestination();

const now = Tone.now()
//play a middle 'C' for the duration of an 8th note
synth.triggerAttackRelease("b5", 0.1, now);
synth.triggerAttackRelease("g2", 0.1, now + 0.25);
synth.triggerAttackRelease("g5", 0.1, now + 0.5);
synth.triggerAttackRelease("g2", 0.1, now + 0.75);
synth.triggerAttackRelease("g2", 0.1, now + 1);

// synth.connect(distortion)