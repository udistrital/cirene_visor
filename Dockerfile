FROM selenium/standalone-firefox:3.5.3
RUN sudo apt update
RUN sudo apt install -y python3-pip xvfb
RUN pip3 install selenium pyvirtualdisplay
