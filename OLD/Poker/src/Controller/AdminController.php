<?php
namespace App\Controller;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\Routing\Annotation\Route;
use Twig\Environment;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;

class AdminController extends Controller
{
    /**
     * @Route("/admin", name="admin.index", methods={"GET"})
     * @Security("has_role('ROLE_ADMIN')")
     */
    public function index(Request $request, Environment $twig): Response
    {
        return new Response('<html><body>Admin page!  <br>
                                     <a href="/">home</a><br>
                                     <a href="/logout">déconnexion</a></body></html>');
    }
}