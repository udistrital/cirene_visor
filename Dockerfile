FROM vvoyer/docker-selenium-firefox-chrome
LABEL authors="juusechec <juusechec@gmail.com>"
USER root

# No interactive frontend during docker build
ENV DEBIAN_FRONTEND=noninteractive \
    DEBCONF_NONINTERACTIVE_SEEN=true

#========================
# Miscellaneous packages
#========================

RUN apt-get -qqy update \
  && apt-get -qqy --no-install-recommends install \
    python3-pip \
  && rm -rf /var/lib/apt/lists/* /var/cache/apt/*

RUN useradd uduser \
         --shell /bin/bash  \
         --create-home \
  && usermod -a -G sudo uduser \
  && echo 'ALL ALL = (ALL) NOPASSWD: ALL' >> /etc/sudoers \
&& echo 'uduser:secret' | chpasswd

USER uduser
