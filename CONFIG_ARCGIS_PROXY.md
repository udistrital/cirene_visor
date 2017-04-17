# Instalar los scripts de https://github.com/Esri/resource-proxy/tree/master/PHP

```bash
# Rationale: https://developers.arcgis.com/javascript/3/jshelp/ags_proxy.html
ifup eth1
yum install -y httpd
systemctl enable httpd
systemctl start httpd
firewall-cmd --permanent --zone=public --add-service=http
firewall-cmd --permanent --zone=public --add-service=https
mkdir /var/www/html/arcgis
# OJO CON CRLF Y LF (EOL "END OF LINE")
mv /home/vagrant/workspace/php/* /var/www/html/arcgis
mv /home/vagrant/workspace/php/.htaccess /var/www/html/arcgis
chown apache:apache /var/www/html/arcgis
chmod 0644 /var/www/html/arcgis
# ps -ef | grep httpd | grep -v grep
# deshabilitar SELINUX
setenforce 0
getenforce
vim /etc/selinux/config # permissive
yum install -y sqlite php-pdo
systemctl restart httpd
```
