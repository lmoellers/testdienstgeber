package model;

import javax.swing.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.awt.event.KeyEvent;
import java.awt.event.KeyListener;
import java.lang.Math;

public class chatbot extends JFrame implements KeyListener {

    private JTextArea chatarea = new JTextArea();
    private JTextField chatbox = new JTextField();
    private JScrollPane scroll = new JScrollPane(
            chatarea,
            JScrollPane.VERTICAL_SCROLLBAR_AS_NEEDED,
            JScrollPane.HORIZONTAL_SCROLLBAR_NEVER
    );

    public chatbot() {
        JFrame frame = new JFrame();
        frame.setDefaultCloseOperation(WindowConstants.EXIT_ON_CLOSE);
        frame.setVisible(true);
        frame.setResizable(false);
        frame.setLayout(null);
        frame.setSize(540, 600);
        frame.setTitle("Chatbot");
        frame.add(chatarea);
        frame.add(chatbox);
        frame.add(scroll);


        // Textarea
        chatarea.setEditable(false);
        chatarea.setSize(540, 400);
        chatarea.setLocation(2, 2);

        // Textfield

        chatbox.setSize(540, 30);
        chatbox.setLocation(2, 500);
        chatbox.addKeyListener(this);



    String[][] chatbot ={
            // Begrüßungen
            {"hi", "hello", "hallo", "hey"},
            {"hallo", "hi", "hey", "hello"},
            // Fragen
            {"wie geht es dir", "alles in ordnung bei dir", "wie geht's"},
            {"gut", "schlecht", "prima", "ging mir nie besser", "geht so"},
            //Ja
            {"ja", "yes", "doch"},
            {"nein", "no", "doch"},
            // Fehler
            {"Versuche es noch mal","chabot ist nicht verfügbar", "mache gerade pause"}
    };


    public static void main(String args[]){

        new chatbot();

    }

    @Override
    public void keyTyped(KeyEvent e) {

    }

    @Override
    public void keyPressed(KeyEvent e) {
        if(e.getKeyCode()==KeyEvent.VK_ENTER) {
            chatbox.setEditable(false);
            //
            String gtext = chatbox.getText();
            chatbox.setText("");
            addText("Ich > " + gtext + "\n");
            //chatarea.append("Me > " + gtext + "\n")); vielleicht anstatt addText
            gtext.trim();
            while (gtext.charAt(gtext.length() - 1) == '!' ||
                    gtext.charAt(gtext.length() - 1) == '.' ||
                    gtext.charAt(gtext.length() - 1) == '?'
                    ) {
                gtext = gtext.substring(0, gtext.length() - 1);
            }
            gtext.trim();
            byte response = 0;
            /*
            0: Wir suchen nach Übereinstimmungen
            1: Wir haben keine Übereinstimmungen gefunden
            2: Wir haben etwas gefunden
             */

            // nach Übereinstimmungen suchen
            int j = 0;
            while (response == 0) {
                if (inArray(gtext.toLowerCase(), chatbot[j * 2])) {
                    response = 2;
                    int r = (int)Math.floor(Math.random()*chatbot[(j*2)+1].length);
                    addText("Chatbot > " + chatbot[(j*2)+1][r]);
                }
                j++;
                if(j*2==chatbot.length-1 && response == 0){
                    response=1;
                }
            }

            //bei einem Fehler
            if(response == 1){
                int r = (int)Math.floor(Math.random()*chatbot[chatbot.length-1].length);
                addText("Chatbot > " +chatbot[chatbot.length-1][r]);
            }
            addText("\n");
        }

    }

    @Override
    public void keyReleased(KeyEvent e) {
        if(e.getKeyCode()==KeyEvent.VK_ENTER){
            chatbox.setEditable(true);
        }

    }

    public void addText(String str){
        chatarea.setText(chatarea.getText() + str);
    }

    public boolean inArray(String in, String [] str){
        boolean match = false;
        for(int i = 0; i < str.length ; i++){
            if(str[i].equals(in)){
                match = true;
            }
        }
        return match;
    }
}

