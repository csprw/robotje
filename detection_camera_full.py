# import winsound
# from TTS.utils.manage import ModelManager
# from TTS.utils.synthesizer import Synthesizer
# import detection_camera
import time
import threading
import os
import random
import json

def speech(text, model):
    ###################
    #text to dpeech section
    model_path = model
    config_path = 'C:/Users/Gebruiker/Documents/litanie/models_voice/config.json'
    speakers_file_path = None
    language_ids_file_path = None
    vocoder_path = None
    vocoder_config_path = None
    encoder_path = None
    encoder_config_path = None
    use_cuda = True
    output_wav = "C:/Users/Gebruiker/Documents/litanie/voice_output/output.wav"

    synthesizer = Synthesizer(
            model_path,
            config_path,
            speakers_file_path,
            language_ids_file_path,
            vocoder_path,
            vocoder_config_path,
            encoder_path,
            encoder_config_path,
            use_cuda,
        )
    

    wav = synthesizer.tts(text)
    synthesizer.save_wav(wav, output_wav)
    print('Done with sythesizing')
    file = "C:/Users/Gebruiker/Documents/litanie/voice_output/output.wav"
    # os.system("afplay " + file)
    winsound.PlaySound(file, winsound.SND_FILENAME)


# def speak_at_random(camera):
#     print("[speak_at_random]")
#     time.sleep(3)
#     models = []
#     rootdir = 'C:/Users/Gebruiker/Documents/litanie/models_voice/'
#     for subdir, _, files in os.walk(rootdir):
#         for file in files:
#             print("file: ", file)

#             if file[-4:] == '.pth':
#                 models.append(os.path.join(subdir, file))
#     print(models)
#     # models = sorted(models)


#     random_model = random.choice(models)
    
#     for i in range(10):

#         random_seconds = random.randint(2,9)
#         time.sleep(random_seconds)
#         random_zin = get_random_sentence(camera)
#         print("Random zin: ", random_seconds, random_zin)
#         speech(random_zin, random_model)


# def get_random_sentence(camera):
#     number_faces = int(camera.number_faces)
#     mannen = 0
#     vrouwen = 0
#     leeftijden = []
#     all_sents = []

#     for person, statistics in camera.stats.items():
#         print(statistics)

#         if statistics['gender'] == "man":
#             mannen += 1
#         else:
#             vrouwen += 1
#         leeftijden.append(statistics['age'])

#     if number_faces ==0:
#         p_sents = ["Er zijn <num> mensen om een sigaret mee te roken", 
#         "er zijn <num> mensen in de ruimte",
#         "Er zijn <num> mensen om opnieuw een liedje voor te zingen"]

#         all_sents.extend(p_sents)
#         random_sent = random.choice(all_sents)
#         random_sent = random_sent.replace("<num>", "geen")

#         return random_sent

#     elif number_faces > 0:

#         if number_faces > 1:
#             p_sents = ["ik wil dat <num> mensen hun best doen om gedurende de installatie niet te hoesten",
#             "Er zijn <num> mensen die ik wil vertellen, dat mijn depressieve aard samen hangt met het voortijdige overlijden van mijn vader",
#             "<num> zullen mij niet meer herinneren"]
#             all_sents.extend(p_sents)

#         if mannen == 1:
#             print("een man anwezig")
#             p_sents = ["<num> man zal mij vanavond opnieuw horen zingen",
#                 "<mannen> jonge man zal mij nog nooit hebben zien spelen",
#                 "<mannen> man zal mij vanavond opnieuw horen zingen",
#                 ]
#             all_sents.extend(p_sents)

#         elif mannen > 1:
#             p_sents = ["<mannen> jonge mannen zullen mij nog nooit hebben zien spelen",
#             "er zijn <mannen> mannen die ik wil vertellen dat mijn depressieve aard samen hangt met het voortijdige overlijden van mijn vader",
#             "<mannen> jonge mannen zal ik bewijzen dat ik ook zonde rlichaam verder zal leven",
#             "Er zijn <num> mensen in de zaal, waarvan er <mannen> man zijn"]
#             all_sents.extend(p_sents)


#         if vrouwen > 0:
#             p_sents =  [" ik wil voor <vrouwen> vrouwen een liedje zingen",
#             "Ik ga <vrouwen> vrouwen vertellen hoe mooi het is dat ze dit gaan meemaken"]

#             all_sents.extend(p_sents)

        

#         all_sents = [
#             "Ik kijk rond. Ik zie <num> mensen. Ik zou deze <num> mensen bij mij in de zaal kunnen hebben. <mannen> mannen, in het publiek. En dan ook <vrouwen> vrouwen. Ik zie iemand van 25 jaar. Misschien moet ik iets voordragen. Of ik zing een lied.",
#             "Ik loop door een fabriek in Eindhoven. Ik kom in een ruimte en zie <num> mensen staan. Daarvan zijn er <mannen> mannen, en <vrouwen> vrouwen. Ik besluit door te lopen naar de volgende ruimte.",
#             "Ik zie <mannen> mannen.",
#             "ik zie <vrouwen> vrouwen.",
#             "ik zie nu <num> mensenn. Deze mensen zouden bij mij in het publiek kunnen zitten.",
#             "Ik ben in een fabriek in Eindhoven. In een ruimte van 5 bij 4 meter. Ik ben hier met <num> mensen",
#             "Ik ben zenuwachtig voor mijn opkomst. Ik ben in een ruimte met <num> mensen.",
#             " In de installatie zijn 4 tafels, 8 microfoons. Er zijn vier plafondluidsprekers. Er is de fabriekshal, en de kelder.",
#             "Ik zie iemand van 25 jaar oud.",
#             "Mijn Curriculum Vitae ziet er zo uit: ik ben geboren in 1962, en ik heet Jeroen. Ik heb in 21 toneelstukken gespeeld volgens mijn Wikipedia pagina. Mijn favoriete rol was mijn hoofdrol in de decamarone. Mijn favoriete schrijver is Frank Wright."]

#         random_sent = random.choice(all_sents)
#         if number_faces == 1:
#             random_sent = random_sent.replace("<num>", "één")
#         else:
#             random_sent = random_sent.replace("<num>", str(camera.number_faces))

#         if mannen == 1:
#             random_sent = random_sent.replace("<mannen>", "geen")
#         elif mannen == 1:
#             random_sent = random_sent.replace("<mannen>", "één")
#         else:
#             random_sent = random_sent.replace("<mannen>", str(mannen))

#         if vrouwen == 1:
#             random_sent = random_sent.replace("<vrouwen>", "geen")
#         elif vrouwen == 1:
#             random_sent = random_sent.replace("<vrouwen>", "één")
#         else:
#             random_sent = random_sent.replace("<vrouwen>", str(vrouwen))

#         return random_sent
        

def read_database(filename):
    print("[read_database]")
    with open(filename) as f_in:
        return json.load(f_in)

def get_cam_stats(camera):
    
    number_faces = int(camera.number_faces)
    current_stats = {}
    
    mannen = 0
    vrouwen = 0
    leeftijden = []

    for person, statistics in camera.stats.items():
        if statistics['gender'] == "man":
            mannen += 1
        else:
            vrouwen += 1
        leeftijden.append(statistics['age'])

    current_stats["mannen"] = mannen
    current_stats["vrouwen"] = vrouwen
    current_stats["leeftijden"] = leeftijden
    current_stats["number_faces"] = int(camera.number_faces)

    return current_stats




def get_sentences(db, scene, stats):
    sentences = db[scene]['sentences']

    mannen_tag = True if int(stats['mannen']) > 0 else False
    vrouwen_tag = True if int(stats['vrouwen']) > 0  else False
    mensen_tag = True if int(stats['number_faces']) > 0 else False

    # Get a sentence with correct number of people
    while True:
        num_tag = False
        # And get a sentence with correct gender
        random_sent = random.choice(sentences)
        print('[get_sentences]: ', random_sent, stats)
        time.sleep(0.1)

        if int(stats['number_faces']) == 0 and '0' in random_sent[1]:
            num_tag = True
        elif int(stats['number_faces']) == 1 and '1' in random_sent[1]:
            num_tag = True
        elif int(stats['number_faces']) > 1 and '2' in random_sent[1]:
            num_tag = True

        if num_tag: 
            if mannen_tag and 'm' in random_sent[2]:
                break
            elif vrouwen_tag and 'f' in random_sent[2]:
                break
            elif mensen_tag and 'x' in random_sent[2]:
                break
    return [random_sent[0]]


def clean_number(num):
    num2word = {0: "geen", 1: "één", 2: "twee", 3: "drie", 4: "vier", 5: "vijf", 6:"zes", 7:"zeven", 8:"acht", 9:"negen", 10:"tien", 11:"elf"}
    if int(num) in num2word.keys():
        num = num2word[int(num)]
    return str(num)


def clean_sentence(stats, sent):
    print("[clean_sentence]", sent)
    mannen_tag = True if "<mannen>" in sent else False
    vrouwen_tag = True if "<vrouwen>" in sent else False
    mensen_tag = True if "<num>" in sent else False

    # Fill in the statistics for m/f/x
    sent = sent.replace("<mannen>", clean_number(stats["mannen"]))
    sent = sent.replace("<vrouwen>", clean_number(stats["vrouwen"]))
    sent = sent.replace("<num>", clean_number(stats["number_faces"]))

    # Make sure the sentence is gramatically correct for m/f/x
    if mannen_tag and int(stats["mannen"]) == 1:
        sent = sent.replace("mannen", "man")
        sent = sent.replace("jongens", "jongen")
    if vrouwen_tag and int(stats["vrouwen"]) == 1:
        sent = sent.replace("vrouwen", "vrouw")
        sent = sent.replace("meisjes", "meisje")
    if mensen_tag and int(stats["number_faces"]) == 1:
        sent = sent.replace("mensen", "mens")
        sent = sent.replace("personen", "persoon")
        sent = sent.replace("gezichten", "gezicht")

    # Now fill in the age tag
    if "<age>" in sent:
        random_age = random.choice(stats["leeftijden"])
        sent = sent.replace("<age>", clean_number(random_age))

    return sent


def speech_placeholder(sent, model):
    print("[speech_placeholder] should speak: ")
    print(sent)

class camera_placeholder:
    def __init__(self):
        self.stats = {}

        self.stats[0] = {}
        self.stats[0]['gender'] = 'man'
        self.stats[0]['age'] = 22
        

        self.stats[1] = {}
        self.stats[1]['gender'] = 'man'
        self.stats[1]['age'] = 22

        self.stats[2] = {}
        self.stats[2]['gender'] = 'vrouw'
        self.stats[2]['age'] = 27

        self.stats[3] = {}
        self.stats[3]['gender'] = 'man'
        self.stats[3]['age'] = 99

        self.number_faces = len(self.stats.keys())




def speak_at_random(camera, model):
    print("[speak_at_random]")

    for i in range(2):
        # Wait for a short time
        random_seconds = random.randint(2,9)
        time.sleep(random_seconds)

        # Get a random sentence
        current_stats = get_cam_stats(camera)
        scene = "2"
        sents = get_sentences(db, scene, current_stats)

        for sent in sents:
            clean_sent = clean_sentence(current_stats, sent)
            speech_placeholder(clean_sent, model)
            # speech(random_zin, model)


if __name__ == "__main__":

    # Paths
    db_path = "../zinnen.json"
    model_path = 'C:/Users/Gebruiker/Documents/litanie/models_voice/best_model_131562.pth'

    # Read database sentences
    db = read_database(db_path)

    # Start up camera
    camera = camera_placeholder()


    speak_at_random(camera, model_path)

    # # Speak at random intervals 
    # current_stats = get_cam_stats(camera)

    # scene = "2"
    # sents = get_sentences(db, scene, current_stats)
    

    # for sent in sents:
    #     clean_sent = clean_sentence(current_stats, sent)
    #     speech_model = "none"
    #     speech_placeholder(clean_sent, speech_model)

    exit(1)

    

    ### Uncomment when done
    # Create camera object
    camera = detection_camera.myCamera()

    # start thread 1
    # camera.run_in_loop()
    p2 = threading.Thread(target= camera.run_in_loop) 
    p2.start()

    # Start thread 2
    # speak_at_random(camera)
    p1 = threading.Thread(target= speak_at_random, args=[camera] )
    p1.start()
    


    


    

